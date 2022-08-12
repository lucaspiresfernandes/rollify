import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
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

const initialState: Omit<Weapon, 'weight' | 'ammo'> & { weight: string; ammo: string | null } = {
	id: 0,
	name: '',
	type: '',
	description: '',
	weight: '0',
	ammo: null,
	damage: '',
	attacks: '',
	range: '',
	visible: true,
};

const WeaponEditorDialog: React.FC<EditorDialogProps<Weapon>> = (props) => {
	const [weapon, setWeapon] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data)
				setWeapon({
					...props.data,
					weight: props.data.weight.toString(),
					ammo: props.data.ammo?.toString() || null,
				});
			else setWeapon(initialState);
		}
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit({
			...weapon,
			weight: parseFloat(weapon.weight.replace(',', '.')) || 0,
			ammo: weapon.ammo ? parseInt(weapon.ammo) || 0 : null,
		});
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box
					id='weaponEditorDialogForm'
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
						label='Name'
						value={weapon.name}
						onChange={(ev) => {
							setWeapon({ ...weapon, name: ev.target.value });
						}}
					/>
					<TextField
						fullWidth
						multiline
						variant='outlined'
						label={t('sheet.table.description')}
						minRows={2}
						maxRows={5}
						value={weapon.description}
						onChange={(ev) => setWeapon({ ...weapon, description: ev.target.value })}
					/>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.type')}
							value={weapon.type}
							onChange={(ev) => setWeapon({ ...weapon, type: ev.target.value })}
						/>

						<TextField
							required
							label={t('sheet.table.weight')}
							inputProps={{ inputMode: 'numeric', pattern: '[0-9,.]*' }}
							value={weapon.weight}
							onChange={(ev) => {
								if (!ev.target.value || ev.target.validity.valid)
									setWeapon({ ...weapon, weight: ev.target.value });
							}}
						/>
					</Box>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.damage')}
							value={weapon.damage}
							onChange={(ev) => setWeapon({ ...weapon, damage: ev.target.value })}
						/>
						<TextField
							label={t('sheet.table.attacks')}
							value={weapon.attacks}
							onChange={(ev) => setWeapon({ ...weapon, attacks: ev.target.value })}
						/>
					</Box>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.range')}
							value={weapon.range}
							onChange={(ev) => setWeapon({ ...weapon, range: ev.target.value })}
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={weapon.ammo !== null}
									onChange={() => setWeapon({ ...weapon, ammo: weapon.ammo === null ? '0' : null })}
								/>
							}
							label={t('admin.editor.hasAmmo')}
						/>
					</Box>
					{weapon.ammo !== null && (
						<TextField
							required
							label={t('sheet.table.ammo')}
							inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
							value={weapon.ammo}
							onChange={(ev) => {
								if (!ev.target.value || ev.target.validity.valid)
									setWeapon({ ...weapon, ammo: ev.target.value });
							}}
						/>
					)}
					<FormControlLabel
						control={
							<Checkbox
								checked={weapon.visible}
								onChange={(ev) => setWeapon({ ...weapon, visible: ev.target.checked })}
							/>
						}
						label={t('sheet.table.visible')}
					/>
				</Box>
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
