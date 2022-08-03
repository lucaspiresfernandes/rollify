import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import NativeSelect from '@mui/material/NativeSelect';
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
	const [value, setValue] = useState<number | ''>(props.data[0]?.id || '');
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) setValue(props.data[0]?.id || '');
	}, [props.open, props.data]);
	
	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		if (value === '') return;
		props.onSubmit(value);
	};

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			TransitionProps={{ onExited: () => setValue('') }}>
			<DialogTitle>{t('modal.title.addData')}</DialogTitle>
			<DialogContent>
				<form id='playerAddDataDialogForm' onSubmit={onSubmit}>
					<NativeSelect
						fullWidth
						value={value}
						onChange={(ev) => setValue(Number(ev.target.value))}
						disabled={props.data.length === 0}>
						{props.data.map((data) => (
							<option key={data.id} value={data.id}>
								{data.name}
							</option>
						))}
					</NativeSelect>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='playerAddDataDialogForm' disabled={props.data.length === 0}>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AddDataDialog;
