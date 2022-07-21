import CircularProgress from '@mui/material/CircularProgress';
import type { CSSProperties } from 'react';

const labelCenter: CSSProperties = {
	textAlign: 'center',
	width: '100%',
	maxWidth: 500,
	height: 75,
	position: 'absolute',
	top: -200,
	left: 0,
	right: 0,
	bottom: 0,
	margin: 'auto',
};

const progressCenter: CSSProperties = {
	width: '100%',
	maxWidth: 75,
	height: 75,
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	margin: 'auto',
};

const LoadingScreen: React.FC<{ title?: string }> = ({ title }) => {
	return (
		<>
			{title && <h2 style={labelCenter}>{title}</h2>}
			<CircularProgress disableShrink style={progressCenter} />
		</>
	);
};

export default LoadingScreen;