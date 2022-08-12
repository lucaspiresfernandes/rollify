import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
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

const initialState = {
	id: 0,
	name: '',
	type: '',
	description: '',
	weight: '0',
	damageReduction: '',
	penalty: '',
	visible: true,
};

const ArmorEditorDialog: React.FC<EditorDialogProps<Armor>> = (props) => {
	const [armor, setArmor] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data)
				setArmor({
					...props.data,
					weight: props.data.weight.toString(),
				});
			else setArmor(initialState);
		}
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit({
			...armor,
			weight: parseFloat(armor.weight.replace(',', '.')) || 0,
		});
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box
					component='form'
					id='armorEditorDialogForm'
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
						value={armor.name}
						onChange={(ev) => setArmor({ ...armor, name: ev.target.value })}
					/>
					<TextField
						fullWidth
						multiline
						variant='outlined'
						label={t('sheet.table.description')}
						minRows={2}
						maxRows={5}
						value={armor.description}
						onChange={(ev) => setArmor({ ...armor, description: ev.target.value })}
					/>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.type')}
							value={armor.type}
							onChange={(ev) => setArmor({ ...armor, type: ev.target.value })}
						/>
						<TextField
							label={t('sheet.table.weight')}
							inputProps={{ inputMode: 'numeric', pattern: '[0-9,.]*' }}
							value={armor.weight}
							onChange={(ev) => {
								if (!ev.target.value || ev.target.validity.valid)
									setArmor({ ...armor, weight: ev.target.value });
							}}
						/>
					</Box>
					<Box display='flex' flexDirection='row' gap={2}>
						<TextField
							label={t('sheet.table.damageReduction')}
							value={armor.damageReduction}
							onChange={(ev) => setArmor({ ...armor, damageReduction: ev.target.value })}
						/>
						<TextField
							label={t('sheet.table.penalty')}
							value={armor.penalty}
							onChange={(ev) => setArmor({ ...armor, penalty: ev.target.value })}
						/>
					</Box>
					<FormControlLabel
						control={
							<Checkbox
								checked={armor.visible}
								onChange={(ev) => setArmor({ ...armor, visible: ev.target.checked })}
							/>
						}
						label={t('sheet.table.visible')}
					/>
				</Box>
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
