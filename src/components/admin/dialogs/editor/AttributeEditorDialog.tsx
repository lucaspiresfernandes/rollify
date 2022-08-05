import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Attribute } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState: Attribute = {
	id: 0,
	name: '',
	color: '#ddaf0f',
	portrait: null,
	rollable: false,
};

const AttributeEditorDialog: React.FC<EditorDialogProps<Attribute>> = (props) => {
	const [attribute, setAttribute] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open && props.data) setAttribute(props.data);
		else setAttribute(initialState);
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(attribute);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<form id='attributeEditorDialogForm' onSubmit={onSubmit}>
					<Box m={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={attribute.name}
							onChange={(ev) => {
								setAttribute({ ...attribute, name: ev.target.value });
							}}
						/>
						<TextField
							required
							fullWidth
							label='Color'
							value={attribute.color}
							onChange={(ev) => {
								setAttribute({ ...attribute, color: ev.target.value });
							}}
						/>
						<p>Retrato</p>
						<p>Rolavel</p>
					</Box>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='attributeEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AttributeEditorDialog;
