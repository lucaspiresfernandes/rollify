import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Skill } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useCallback, useContext, useMemo, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { SkillSheetApiResponse } from '../../../pages/api/sheet/skill';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import SkillEditorDialog from '../dialogs/editor/SkillEditorDialog';
import EditorContainer from './EditorContainer';

type SkillEditorContainerProps = {
	skill: Skill[];
};

const SkillEditorContainer: React.FC<SkillEditorContainerProps> = (props) => {
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

	const onCopySkill = useCallback(
		(id: number) => {
			setDialogData({ operation: 'create', data: skill.find((i) => i.id === id) });
			setOpenDialog(true);
		},
		[skill]
	);

	const onDeleteSkill = useCallback(
		(id: number) => {
			if (!confirm(t('prompt.delete', { name: 'item' }))) return;
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

	const skillList = useMemo(() => skill.sort((a, b) => a.name.localeCompare(b.name)), [skill]);

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
			<EditorContainer
				data={skillList}
				onEdit={onEditSkill}
				onDelete={onDeleteSkill}
				onCopy={onCopySkill}
			/>
			<SkillEditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.skill'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
				operation={dialogData.operation}
			/>
		</Section>
	);
};

export default SkillEditorContainer;
