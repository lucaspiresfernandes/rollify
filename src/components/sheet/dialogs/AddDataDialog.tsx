import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { Locale } from '../../../i18n';

export type AddDataDialogProps = {
	data: { id: number; name: string }[];
	open: boolean;
	onClose: () => void;
	onSubmit: (id: number) => void;
};

const AddDataDialog: React.FC<AddDataDialogProps> = (props) => {
	const [value, setValue] = useState(props.data[0]?.id || '');
	const { t } = useI18n<Locale>();

	useEffect(() => {}, [props.data]);

	useEffect(() => {
		if (props.open) setValue(props.data[0]?.id || '');
		else setValue('');
	}, [props.open, props.data]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(Number(value));
	};

	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>{t('modal.title.addData')}</DialogTitle>
			<DialogContent>
				<form id='playerAddDataDialogForm' onSubmit={onSubmit}>
					<Select
						fullWidth
						value={value}
						onChange={(ev) => setValue(Number(ev.target.value))}
						disabled={props.data.length === 0}>
						{props.data.map((data) => (
							<MenuItem key={data.id} value={data.id}>
								{data.name}
							</MenuItem>
						))}
					</Select>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='playerAddDataDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AddDataDialog;
