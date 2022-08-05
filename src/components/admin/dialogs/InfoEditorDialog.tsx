import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { Info } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { Locale } from '../../../i18n';
import type { EditorDialogProps } from './editor';

const initialState: Info = {
	id: 0,
	name: '',
};

const InfoEditorDialog: React.FC<EditorDialogProps<Info>> = (props) => {
	const [info, setInfo] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open && props.data) setInfo(props.data);
	}, [props.data, props.open]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(info);
	};

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			TransitionProps={{ onExited: () => setInfo(initialState) }}
			maxWidth='xs'
			fullWidth>
			<DialogTitle>TODO: edit</DialogTitle>
			<DialogContent>
				<form id='infoEditorDialogForm' onSubmit={onSubmit}>
					<Box m={1}>
						<TextField
							required
							autoFocus
							fullWidth
							label='Name'
							value={info.name}
							onChange={(ev) => {
								setInfo({ ...info, name: ev.target.value });
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

export default InfoEditorDialog;
