import CloseIcon from '@mui/icons-material/Close';
import Alert, { AlertColor } from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import type { TransitionProps } from '@mui/material/transitions';

export type SnackbarContainerProps = {
	open: boolean;
	onClose: (event: React.SyntheticEvent<any> | Event, reason: SnackbarCloseReason) => void;
	TransitionProps: TransitionProps;
	onCloseClick: React.MouseEventHandler<HTMLButtonElement>;
	severity?: AlertColor;
	text: string;
};

const SnackbarContainer: React.FC<SnackbarContainerProps> = (props) => {
	return (
		<Snackbar
			open={props.open}
			autoHideDuration={6000}
			onClose={props.onClose}
			TransitionProps={props.TransitionProps}>
			<Alert
				severity={props.severity || 'info'}
				variant='filled'
				action={
					<IconButton size='small' aria-label='close' color='inherit' onClick={props.onCloseClick}>
						<CloseIcon fontSize='small' />
					</IconButton>
				}>
				{props.text}
			</Alert>
		</Snackbar>
	);
};

export default SnackbarContainer;
