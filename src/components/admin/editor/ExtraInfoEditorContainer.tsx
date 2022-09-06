import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { ExtraInfo } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ExtraInfoSheetApiResponse } from '../../../pages/api/sheet/extrainfo';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import EditorDialog from '../dialogs/editor/EditorDialog';
import EditorContainer from './EditorContainer';

type ExtraInfoEditorContainerProps = {
	title: string;
	extraInfo: ExtraInfo[];
};

const ExtraInfoEditorContainer: React.FC<ExtraInfoEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [extraInfo, setExtraInfo] = useState(props.extraInfo);
	const [dialogData, setDialogData] = useState<EditorDialogData<ExtraInfo>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: ExtraInfo) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/extrainfo', { method: dialogData.operation === 'create' ? 'PUT' : 'POST', data })
			.then((res: AxiosResponse<ExtraInfoSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newInfo = res.data.extraInfo;

				if (dialogData.operation === 'create') return setExtraInfo((i) => [...i, newInfo]);

				setExtraInfo((info) =>
					info.map((i) => {
						if (i.id === newInfo.id) return newInfo;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteExtraInfo = (id: number) => {
		if (!confirm(t('prompt.delete', { name: 'item' }))) return;
		setLoading(true);
		api
			.delete<ExtraInfoSheetApiResponse>('/sheet/extrainfo', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setExtraInfo((info) => info.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<Section
			title={`${props.title} (Extra)`}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.extraInfo')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={extraInfo}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: extraInfo.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onCopy={(id) => {
					setDialogData({ operation: 'create', data: extraInfo.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteExtraInfo}
			/>
			<EditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.extraInfo'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default ExtraInfoEditorContainer;
