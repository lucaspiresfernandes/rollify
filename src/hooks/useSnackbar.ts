import { useCallback, useRef, useState } from 'react';
import type { SnackbarContainerProps } from '../components/SnackbarContainer';
import type { LoggerProps } from '../contexts';

type SnackbarUpdate = (props: LoggerProps) => void;

export default function useSnackbar(): [SnackbarContainerProps, SnackbarUpdate] {
	const [show, setShow] = useState(false);
	const [logger, setLogger] = useState<LoggerProps>({
		severity: 'success',
		text: '',
	});
	const queuedLog = useRef<LoggerProps>();

	const updateSnackbar = useCallback<SnackbarUpdate>((props) => {
		setShow((show) => {
			if (show) {
				queuedLog.current = props;
				return false;
			}
			setLogger(props);
			return true;
		});
	}, []);

	const onSnackbarExited = useCallback(() => {
		if (!queuedLog.current) return;
		setLogger(queuedLog.current);
		setShow(true);
		queuedLog.current = undefined;
	}, []);

	const handleClose = useCallback((_event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') return;
		setShow(false);
	}, []);

	return [
		{
			open: show,
			onClose: handleClose,
			TransitionProps: { onExited: onSnackbarExited },
			onCloseClick: handleClose,
			severity: logger.severity,
			text: logger.text,
		},
		updateSnackbar,
	];
}
