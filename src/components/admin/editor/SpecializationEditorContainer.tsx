import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Specialization } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { SpecializationSheetApiResponse } from '../../../pages/api/sheet/specialization';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import EditorDialog from '../dialogs/editor/EditorDialog';
import EditorContainer from './EditorContainer';

type SpecializationEditorContainerProps = {
	title: string;
	specialization: Specialization[];
};

const SpecializationEditorContainer: React.FC<SpecializationEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [specialization, setSpecialization] = useState(props.specialization);
	const [dialogData, setDialogData] = useState<EditorDialogData<Specialization>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Specialization) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/specialization', {
			method: dialogData.operation === 'create' ? 'PUT' : 'POST',
			data,
		})
			.then((res: AxiosResponse<SpecializationSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newSpecialization = res.data.specialization;

				if (dialogData.operation === 'create')
					return setSpecialization((i) => [...i, newSpecialization]);

				setSpecialization((specialization) =>
					specialization.map((i) => {
						if (i.id === newSpecialization.id) return newSpecialization;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteSpecialization = (id: number) => {
		if (!confirm(t('prompt.delete'))) return;
		setLoading(true);
		api
			.delete<SpecializationSheetApiResponse>('/sheet/specialization', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setSpecialization((specialization) => specialization.filter((i) => i.id !== id));
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
					title='TODO: Add Specialization'>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={specialization}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: specialization.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteSpecialization}
			/>
			<EditorDialog
				title='TODO: Add Specialization'
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default SpecializationEditorContainer;
