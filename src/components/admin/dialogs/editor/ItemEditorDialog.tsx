import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Item } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState = {
	id: 0,
	name: '',
	description: '',
	weight: '0',
	visible: true,
};

const ItemEditorDialog: React.FC<EditorDialogProps<Item>> = (props) => {
	const [item, setItem] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data) setItem({ ...props.data, weight: props.data.weight.toString() });
			else setItem(initialState);
		}
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit({ ...item, weight: parseInt(item.weight.replace(',', '.')) || 0 });
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box
					id='itemEditorDialogForm'
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
						value={item.name}
						onChange={(ev) => setItem({ ...item, name: ev.target.value })}
					/>
					<TextField
						fullWidth
						multiline
						variant='outlined'
						label={t('sheet.table.description')}
						minRows={2}
						maxRows={5}
						value={item.description}
						onChange={(ev) => setItem({ ...item, description: ev.target.value })}
					/>
					<TextField
						required
						label={t('sheet.table.weight')}
						inputProps={{ inputMode: 'numeric', pattern: '[0-9,.]*' }}
						value={item.weight}
						onChange={(ev) => {
							if (!ev.target.value || ev.target.validity.valid)
								setItem({ ...item, weight: ev.target.value });
						}}
					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={item.visible}
								onChange={(ev) => setItem({ ...item, visible: ev.target.checked })}
							/>
						}
						label={t('sheet.table.visible')}
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='itemEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ItemEditorDialog;
