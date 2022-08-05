import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Info } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { InfoSheetApiResponse } from '../../../pages/api/sheet/info';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import EditorDialog from '../dialogs/editor/EditorDialog';
import EditorContainer from './EditorContainer';

type InfoEditorContainerProps = {
	title: string;
	info: Info[];
};

const InfoEditorContainer: React.FC<InfoEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [info, setInfo] = useState(props.info);
	const [dialogData, setDialogData] = useState<EditorDialogData<Info>>({ operation: 'create' });
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Info) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/info', { method: dialogData.operation === 'create' ? 'PUT' : 'POST', data })
			.then((res: AxiosResponse<InfoSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newInfo = res.data.info;

				if (dialogData.operation === 'create') return setInfo((i) => [...i, newInfo]);

				setInfo((info) =>
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

	const onDeleteInfo = (id: number) => {
		if (!confirm(t('prompt.delete'))) return;
		setLoading(true);
		api
			.delete<InfoSheetApiResponse>('/sheet/info', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setInfo((info) => info.filter((i) => i.id !== id));
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
					title='TODO: Add Info'>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={info}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: info.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteInfo}
			/>
			<EditorDialog
				title='TODO: Add Info'
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default InfoEditorContainer;
