import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Spec } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { SpecSheetApiResponse } from '../../../pages/api/sheet/spec';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import EditorDialog from '../dialogs/editor/EditorDialog';
import EditorContainer from './EditorContainer';

type SpecEditorContainerProps = {
	spec: Spec[];
};

const SpecEditorContainer: React.FC<SpecEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [spec, setSpec] = useState(props.spec);
	const [dialogData, setDialogData] = useState<EditorDialogData<Spec>>({ operation: 'create' });
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Spec) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/spec', { method: dialogData.operation === 'create' ? 'PUT' : 'POST', data })
			.then((res: AxiosResponse<SpecSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newSpec = res.data.spec;

				if (dialogData.operation === 'create') return setSpec((i) => [...i, newSpec]);

				setSpec((spec) =>
					spec.map((i) => {
						if (i.id === newSpec.id) return newSpec;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteSpec = (id: number) => {
		if (!confirm(t('prompt.delete'))) return;
		setLoading(true);
		api
			.delete<SpecSheetApiResponse>('/sheet/spec', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setSpec((spec) => spec.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<Section
			title={t('admin.editor.spec')}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.spec')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={spec}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: spec.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteSpec}
			/>
			<EditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t('admin.editor.spec')}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default SpecEditorContainer;
