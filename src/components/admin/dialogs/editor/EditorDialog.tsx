import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type {
	Characteristic,
	Currency,
	ExtraInfo,
	Info,
	Spec,
	Specialization,
} from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { Locale } from '../../../../i18n';
import type { EditorDialogProps } from '.';

type EditorDialogDataType = Info | Spec | Characteristic | Specialization | Currency | ExtraInfo;

const initialState: EditorDialogDataType = {
	id: 0,
	name: '',
};

const EditorDialog: React.FC<EditorDialogProps<EditorDialogDataType>> = (props) => {
	const [data, setData] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open && props.data) setData(props.data);
		else setData(initialState);
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(data);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<form id='infoEditorDialogForm' onSubmit={onSubmit}>
					<Box pt={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={data.name}
							onChange={(ev) => {
								setData({ ...data, name: ev.target.value });
							}}
						/>
					</Box>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='infoEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditorDialog;
