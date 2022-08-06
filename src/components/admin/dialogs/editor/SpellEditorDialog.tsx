import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
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
	visible: true,
};

const SpellEditorDialog: React.FC<EditorDialogProps<Spell>> = (props) => {
	const [spell, setSpell] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data) setSpell(props.data);
			else setSpell(initialState);
		}
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(spell);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box
					id='spellEditorDialogForm'
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
						value={spell.name}
						onChange={(ev) => setSpell({ ...spell, name: ev.target.value })}
					/>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.type')}
							value={spell.type}
							onChange={(ev) => setSpell({ ...spell, type: ev.target.value })}
						/>

						<TextField
							label={t('sheet.table.slots')}
							value={spell.slots}
							inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
							onChange={(ev) => {
								if (!ev.target.value || ev.target.validity.valid)
									setSpell({ ...spell, slots: parseInt(ev.target.value) || 0 });
							}}
						/>
					</Box>
					<TextField
						fullWidth
						multiline
						variant='outlined'
						label={t('sheet.table.description')}
						minRows={2}
						maxRows={5}
						value={spell.description}
						onChange={(ev) => setSpell({ ...spell, description: ev.target.value })}
					/>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.castingTime')}
							value={spell.castingTime}
							onChange={(ev) => setSpell({ ...spell, castingTime: ev.target.value })}
						/>
						<TextField
							label={t('sheet.table.cost')}
							value={spell.cost}
							onChange={(ev) => setSpell({ ...spell, cost: ev.target.value })}
						/>
					</Box>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.duration')}
							value={spell.duration}
							onChange={(ev) => setSpell({ ...spell, duration: ev.target.value })}
						/>
						<TextField
							label={t('sheet.table.target')}
							value={spell.target}
							onChange={(ev) => setSpell({ ...spell, target: ev.target.value })}
						/>
					</Box>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.range')}
							value={spell.range}
							onChange={(ev) => setSpell({ ...spell, range: ev.target.value })}
						/>
						<TextField
							label={t('sheet.table.damage')}
							value={spell.damage}
							onChange={(ev) => setSpell({ ...spell, damage: ev.target.value })}
						/>
					</Box>
					<FormControlLabel
						control={
							<Checkbox
								checked={spell.visible}
								onChange={(ev) => setSpell({ ...spell, visible: ev.target.checked })}
							/>
						}
						label={t('sheet.table.visible')}
					/>
				</Box>
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
