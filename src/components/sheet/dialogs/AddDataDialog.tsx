import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import NativeSelect from '@mui/material/NativeSelect';
import { useI18n } from 'next-rosetta';
import { useEffect, useMemo, useState } from 'react';
import type { Locale } from '../../../i18n';

export type AddDataDialogProps = {
	data: { id: number; name: string }[];
	open: boolean;
	onClose: () => void;
	onCreate?: () => void;
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

	const dataList = useMemo(
		() => props.data.sort((a, b) => a.name.localeCompare(b.name)),
		[props.data]
	);

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{t('modal.title.addData')}</DialogTitle>
			<DialogContent>
				<form id='playerAddDataDialogForm' onSubmit={onSubmit}>
					<NativeSelect
						fullWidth
						value={value}
						onChange={(ev) => setValue(Number(ev.target.value))}
						disabled={props.data.length === 0}>
						{dataList.map((data) => (
							<option key={data.id} value={data.id}>
								{data.name}
							</option>
						))}
					</NativeSelect>
				</form>
			</DialogContent>
			<DialogActions>
				{props.onCreate && (
					<Box flexGrow={1}>
						<Button onClick={props.onCreate}>{t('modal.create')}</Button>
					</Box>
				)}
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='playerAddDataDialogForm' disabled={props.data.length === 0}>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AddDataDialog;
