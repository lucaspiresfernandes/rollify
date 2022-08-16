import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Skill } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogData, EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState = {
	id: 0,
	name: '',
	startValue: '1',
};

type Props = EditorDialogProps<Skill> & {
	operation: EditorDialogData<Skill>['operation'];
};

const SkillEditorDialog: React.FC<Props> = (props) => {
	const [skill, setSkill] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data) setSkill({ ...props.data, startValue: props.data.startValue.toString() });
			else setSkill(initialState);
		}
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit({ ...skill, startValue: parseInt(skill.startValue) || 0 });
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box
					id='skillEditorDialogForm'
					component='form'
					onSubmit={onSubmit}
					display='flex'
					flexDirection='column'
					gap={2}
					mt={1}>
					<TextField
						required
						autoFocus
						fullWidth
						label={t('sheet.table.name')}
						value={skill.name}
						onChange={(ev) => {
							setSkill({ ...skill, name: ev.target.value });
						}}
					/>
					{props.operation === 'create' && (
						<TextField
							required
							label={t('sheet.table.startValue')}
							inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,3}' }}
							value={skill.startValue}
							onChange={(ev) => {
								if (!ev.target.value || ev.target.validity.valid)
									setSkill({ ...skill, startValue: ev.target.value });
							}}
						/>
					)}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='skillEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SkillEditorDialog;
