import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

type PlayerAttributeEditorDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (value: number, maxValue: number) => void;
	startValue: {
		value: number;
		maxValue: number;
	};
};

const PlayerAttributeEditorDialog: React.FC<PlayerAttributeEditorDialogProps> = (props) => {
	const [value, setValue] = useState('0');
	const [maxValue, setMaxValue] = useState('0');

	useEffect(() => {
		if (props.open) {
			setValue(props.startValue.value.toString());
			setMaxValue(props.startValue.maxValue.toString());
		}
	}, [props.open, props.startValue]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(parseInt(value), parseInt(maxValue));
	};

	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>TODO: ATTRIBUTE EDITOR</DialogTitle>
			<DialogContent>
				<Grid
					container
					component='form'
					id='PlayerAttributeEditorDialogForm'
					onSubmit={onSubmit}
					spacing={3}
					mt={0}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='number'
							variant='standard'
							label='TODO: Valor Atual'
							value={value}
							onChange={(ev) => setValue(ev.target.value)}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='number'
							variant='standard'
							label='TODO: Valor Máximo'
							value={maxValue}
							onChange={(ev) => setMaxValue(ev.target.value)}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>Cancel</Button>
				<Button type='submit' form='PlayerAttributeEditorDialogForm'>
					Apply
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlayerAttributeEditorDialog;
