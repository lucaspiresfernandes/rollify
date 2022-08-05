import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Weapon } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState: Weapon = {
	id: 0,
	name: '',
	ammo: null,
	damage: '',
	attacks: '',
	range: '',
	weight: 0,
	type: '',
	visible: false,
};

const WeaponEditorDialog: React.FC<EditorDialogProps<Weapon>> = (props) => {
	const [weapon, setWeapon] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open && props.data) setWeapon(props.data);
		else setWeapon(initialState);
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(weapon);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<form id='weaponEditorDialogForm' onSubmit={onSubmit}>
					<Box m={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={weapon.name}
							onChange={(ev) => {
								setWeapon({ ...weapon, name: ev.target.value });
							}}
						/>
						<p>type</p>
						<p>weight</p>
						<p>ammo</p>
						<p>damage</p>
						<p>attacks</p>
						<p>range</p>
						<p>visible</p>
					</Box>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='weaponEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default WeaponEditorDialog;
