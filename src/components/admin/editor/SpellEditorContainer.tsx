import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Spell } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { SpellSheetApiResponse } from '../../../pages/api/sheet/spell';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import SpellEditorDialog from '../dialogs/editor/SpellEditorDialog';
import EditorContainer from './EditorContainer';

type SpellEditorContainerProps = {
	title: string;
	spell: Spell[];
};

const SpellEditorContainer: React.FC<SpellEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [spell, setSpell] = useState(props.spell);
	const [dialogData, setDialogData] = useState<EditorDialogData<Spell>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Spell) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/spell', {
			method: dialogData.operation === 'create' ? 'PUT' : 'POST',
			data,
		})
			.then((res: AxiosResponse<SpellSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newSpell = res.data.spell[0];

				if (dialogData.operation === 'create') return setSpell((i) => [...i, newSpell]);

				setSpell((spell) =>
					spell.map((i) => {
						if (i.id === newSpell.id) return newSpell;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteSpell = (id: number) => {
		if (!confirm(t('prompt.delete'))) return;
		setLoading(true);
		api
			.delete<SpellSheetApiResponse>('/sheet/spell', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setSpell((spell) => spell.filter((i) => i.id !== id));
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
					title='TODO: Add Spell'>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={spell}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: spell.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteSpell}
			/>
			<SpellEditorDialog
				title='TODO: Add Spell'
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default SpellEditorContainer;
