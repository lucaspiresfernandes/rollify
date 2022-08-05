import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Armor } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState: Armor = {
	id: 0,
	name: '',
	type: '',
	weight: 0,
	damageReduction: '',
	penalty: '',
	visible: false,
};

const ArmorEditorDialog: React.FC<EditorDialogProps<Armor>> = (props) => {
	const [armor, setArmor] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open && props.data) setArmor(props.data);
		else setArmor(initialState);
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(armor);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<form id='armorEditorDialogForm' onSubmit={onSubmit}>
					<Box m={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={armor.name}
							onChange={(ev) => {
								setArmor({ ...armor, name: ev.target.value });
							}}
						/>
						<p>type</p>
						<p>weight</p>
						<p>damageReduction</p>
						<p>penalty</p>
						<p>visible</p>
					</Box>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='armorEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ArmorEditorDialog;
