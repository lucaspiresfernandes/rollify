import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import type { Skill, Specialization } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useCallback, useContext, useMemo, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { SkillSheetApiResponse } from '../../../pages/api/sheet/skill';
import type { SpecializationSheetApiResponse } from '../../../pages/api/sheet/specialization';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import EditorDialog from '../dialogs/editor/EditorDialog';
import SkillEditorDialog from '../dialogs/editor/SkillEditorDialog';
import EditorContainer from './EditorContainer';

type SpecializationEditorContainerProps = {
	skill: Skill[];
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

				setSpecialization((spec) =>
					spec.map((i) => {
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
		if (!confirm(t('prompt.delete', {name: 'item'}))) return;
		setLoading(true);
		api
			.delete<SpecializationSheetApiResponse>('/sheet/specialization', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setSpecialization((spec) => spec.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<>
			<Grid item xs={12} md={6}>
				<Section
					title={t('admin.editor.specialization')}
					position='relative'
					sideButton={
						<IconButton
							onClick={() => {
								setDialogData({ operation: 'create' });
								setOpenDialog(true);
							}}
							title={`${t('add')} ${t('admin.editor.specialization')}`}>
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
						title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
							'admin.editor.specialization'
						)}`}
						open={openDialog}
						onClose={() => setOpenDialog(false)}
						onSubmit={onDialogSubmit}
						data={dialogData.data}
					/>
				</Section>
			</Grid>
			<Grid item xs={12} md={6}>
				<SkillEditorContainer skill={props.skill} specialization={specialization} />
			</Grid>
		</>
	);
};

const SkillEditorContainer: React.FC<SpecializationEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [skill, setSkill] = useState(props.skill);
	const [dialogData, setDialogData] = useState<EditorDialogData<Skill>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = useCallback(
		(data: Skill) => {
			setOpenDialog(false);
			setLoading(true);

			api('/sheet/skill', {
				method: dialogData.operation === 'create' ? 'PUT' : 'POST',
				data,
			})
				.then((res: AxiosResponse<SkillSheetApiResponse>) => {
					if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
					const newSkill = res.data.skill[0];

					if (dialogData.operation === 'create') return setSkill((i) => [...i, newSkill]);

					setSkill((skill) =>
						skill.map((i) => {
							if (i.id === newSkill.id) return newSkill;
							return i;
						})
					);
				})
				.catch((err) =>
					log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
				)
				.finally(() => setLoading(false));
		},
		[dialogData, log, t]
	);

	const onEditSkill = useCallback(
		(id: number) => {
			setDialogData({ operation: 'update', data: skill.find((i) => i.id === id) });
			setOpenDialog(true);
		},
		[skill]
	);

	const onDeleteSkill = useCallback(
		(id: number) => {
			if (!confirm(t('prompt.delete', {name: 'item'}))) return;
			setLoading(true);
			api
				.delete<SkillSheetApiResponse>('/sheet/skill', { data: { id } })
				.then((res) => {
					if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
					setSkill((status) => status.filter((i) => i.id !== id));
				})
				.catch((err) =>
					log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
				)
				.finally(() => setLoading(false));
		},
		[log, t]
	);

	const skillList = useMemo(
		() =>
			skill
				.map((sk) => {
					const specialization = props.specialization.find((i) => i.id === sk.specialization_id);
					if (specialization) return { ...sk, name: `${specialization.name} (${sk.name})` };
					return sk;
				})
				.sort((a, b) => a.name.localeCompare(b.name)),
		[skill, props.specialization]
	);

	return (
		<Section
			title={t('admin.editor.skill')}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.skill')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer data={skillList} onEdit={onEditSkill} onDelete={onDeleteSkill} />
			<SkillEditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.skill'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				specialization={props.specialization}
				data={dialogData.data}
				operation={dialogData.operation}
			/>
		</Section>
	);
};

export default SpecializationEditorContainer;
