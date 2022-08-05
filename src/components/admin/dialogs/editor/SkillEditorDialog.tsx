import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Skill, Specialization } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState: Skill = {
	id: 0,
	name: '',
	specialization_id: null,
	startValue: 1,
};

type Props = EditorDialogProps<Skill> & { specialization: Specialization[] };

const SkillEditorDialog: React.FC<Props> = (props) => {
	const [skill, setSkill] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data) setSkill(props.data);
			else setSkill(initialState);
		}
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(skill);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<form id='skillEditorDialogForm' onSubmit={onSubmit}>
					<Box m={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={skill.name}
							onChange={(ev) => {
								setSkill({ ...skill, name: ev.target.value });
							}}
						/>
						<p>specialization_id</p>
						<p>start value</p>
					</Box>
				</form>
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
