import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { Locale } from '../../../i18n';

type PlayerAttributeEditorDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (value: number, maxValue: number, extraValue: number) => void;
	startValue: {
		value: number;
		maxValue: number;
		extraValue: number;
	};
};

const PlayerAttributeEditorDialog: React.FC<PlayerAttributeEditorDialogProps> = (props) => {
	const [value, setValue] = useState('0');
	const [maxValue, setMaxValue] = useState('0');
	const [extraValue, setExtraValue] = useState('0');
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			setValue(props.startValue.value.toString());
			setMaxValue(props.startValue.maxValue.toString());
			setExtraValue(props.startValue.extraValue.toString());
		}
	}, [props.open, props.startValue]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(parseInt(value), parseInt(maxValue), parseInt(extraValue));
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{t('modal.title.attributeEditor')}</DialogTitle>
			<DialogContent>
				<Box
					id='playerAttributeEditorDialogForm'
					component='form'
					display='flex'
					flexDirection='column'
					gap={2}
					mt={1}
					onSubmit={onSubmit}>
					<TextField
						type='number'
						variant='standard'
						label={t('modal.label.currentValue')}
						value={value}
						onChange={(ev) => setValue(ev.target.value)}
					/>
					<TextField
						type='number'
						variant='standard'
						label={t('modal.label.maxValue')}
						value={maxValue}
						onChange={(ev) => setMaxValue(ev.target.value)}
					/>
					<TextField
						type='number'
						variant='standard'
						label={t('modal.label.extraValue')}
						value={extraValue}
						onChange={(ev) => setExtraValue(ev.target.value)}
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='playerAttributeEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlayerAttributeEditorDialog;
