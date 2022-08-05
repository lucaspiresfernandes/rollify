import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Armor } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ArmorSheetApiResponse } from '../../../pages/api/sheet/armor';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import ArmorEditorDialog from '../dialogs/editor/ArmorEditorDialog';
import EditorContainer from './EditorContainer';

type ArmorEditorContainerProps = {
	title: string;
	armor: Armor[];
};

const ArmorEditorContainer: React.FC<ArmorEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [armor, setArmor] = useState(props.armor);
	const [dialogData, setDialogData] = useState<EditorDialogData<Armor>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Armor) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/armor', {
			method: dialogData.operation === 'create' ? 'PUT' : 'POST',
			data,
		})
			.then((res: AxiosResponse<ArmorSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newArmor = res.data.armor[0];

				if (dialogData.operation === 'create') return setArmor((i) => [...i, newArmor]);

				setArmor((armor) =>
					armor.map((i) => {
						if (i.id === newArmor.id) return newArmor;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteArmor = (id: number) => {
		if (!confirm(t('prompt.delete'))) return;
		setLoading(true);
		api
			.delete<ArmorSheetApiResponse>('/sheet/armor', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setArmor((armor) => armor.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<Section
			title={props.title}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title='TODO: Add Armor'>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={armor}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: armor.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteArmor}
			/>
			<ArmorEditorDialog
				title='TODO: Add Armor'
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default ArmorEditorContainer;
