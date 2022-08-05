import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Item } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState: Item = {
	id: 0,
	name: '',
	description: '',
	weight: 0,
	visible: true,
};

const ItemEditorDialog: React.FC<EditorDialogProps<Item>> = (props) => {
	const [item, setItem] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data) setItem(props.data);
			else setItem(initialState);
		}
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(item);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<form id='itemEditorDialogForm' onSubmit={onSubmit}>
					<Box m={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={item.name}
							onChange={(ev) => {
								setItem({ ...item, name: ev.target.value });
							}}
						/>
						<p>description</p>
						<p>weight</p>
						<p>visible</p>
					</Box>
				</form>
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
