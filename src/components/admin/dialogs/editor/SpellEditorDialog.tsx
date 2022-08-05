import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Spell } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState: Spell = {
	id: 0,
	name: '',
	type: '',
	slots: 0,
	description: '',
	castingTime: '',
	cost: '',
	duration: '',
	target: '',
	range: '',
	damage: '',
	visible: false,
};

const SpellEditorDialog: React.FC<EditorDialogProps<Spell>> = (props) => {
	const [spell, setSpell] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open && props.data) setSpell(props.data);
		else setSpell(initialState);
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(spell);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<form id='spellEditorDialogForm' onSubmit={onSubmit}>
					<Box m={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={spell.name}
							onChange={(ev) => {
								setSpell({ ...spell, name: ev.target.value });
							}}
						/>
						<p>type</p>
						<p>slots</p>
						<p>description</p>
						<p>castingTime</p>
						<p>cost</p>
						<p>duration</p>
						<p>target</p>
						<p>range</p>
						<p>damage</p>
						<p>visible</p>
					</Box>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='spellEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SpellEditorDialog;
