import Box, { BoxProps } from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import PartialBackdrop from '../../PartialBackdrop';

type SettingsContainerProps = BoxProps & {
	loading: boolean;
	children?: React.ReactNode;
	onApply: () => void;
};

const SettingsContainer: React.FC<SettingsContainerProps> = ({
	loading,
	children,
	onApply,
	...props
}) => {
	return (
		<Box
			display='flex'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
			position='relative'
			{...props}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			{children}
			<Divider flexItem />
			<Box alignSelf='end'>
				<Button variant='contained' onClick={onApply}>
					Apply
				</Button>
			</Box>
		</Box>
	);
};

export default SettingsContainer;
