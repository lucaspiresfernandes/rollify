import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Characteristic } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { CharacteristicSheetApiResponse } from '../../../pages/api/sheet/characteristic';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import EditorDialog from '../dialogs/editor/EditorDialog';
import EditorContainer from './EditorContainer';

type CharacteristicEditorContainerProps = {
	characteristic: Characteristic[];
};

const CharacteristicEditorContainer: React.FC<CharacteristicEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [characteristic, setCharacteristic] = useState(props.characteristic);
	const [dialogData, setDialogData] = useState<EditorDialogData<Characteristic>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Characteristic) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/characteristic', {
			method: dialogData.operation === 'create' ? 'PUT' : 'POST',
			data,
		})
			.then((res: AxiosResponse<CharacteristicSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newCharacteristic = res.data.characteristic;

				if (dialogData.operation === 'create')
					return setCharacteristic((i) => [...i, newCharacteristic]);

				setCharacteristic((characteristic) =>
					characteristic.map((i) => {
						if (i.id === newCharacteristic.id) return newCharacteristic;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteCharacteristic = (id: number) => {
		if (!confirm(t('prompt.delete'))) return;
		setLoading(true);
		api
			.delete<CharacteristicSheetApiResponse>('/sheet/characteristic', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setCharacteristic((characteristic) => characteristic.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<Section
			title={t('admin.editor.characteristic')}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.characteristic')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={characteristic}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: characteristic.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteCharacteristic}
			/>
			<EditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.characteristic'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default CharacteristicEditorContainer;
