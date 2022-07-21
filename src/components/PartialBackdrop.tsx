import Backdrop, { BackdropProps } from '@mui/material/Backdrop';
import { alpha, styled } from '@mui/material/styles';

const StyledBackdrop = styled(Backdrop)<BackdropProps>(({ theme }) => ({
	zIndex: theme.zIndex.drawer,
	position: 'absolute',
	backgroundColor: alpha(theme.palette.background.default, 0.75),
}));

const PartialBackdrop: React.FC<BackdropProps> = (props) => {
	return <StyledBackdrop {...props} />;
};

export default PartialBackdrop;
