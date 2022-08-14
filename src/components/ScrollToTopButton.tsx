import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import { startTransition, useCallback, useEffect, useState } from 'react';

const ScrollToTopButton: React.FC = () => {
	const [visible, setVisible] = useState(false);

	const scrollEvent = useCallback(() => startTransition(() => setVisible(window.scrollY > 0)), []);

	useEffect(() => {
		document.addEventListener('scroll', scrollEvent);
		return () => {
			document.removeEventListener('scroll', scrollEvent);
		};
	}, [scrollEvent]);

	return (
		<Box position='fixed' bottom={19} right={15}>
			<Fade in={visible}>
				<Fab
					size='small'
					color='primary'
					aria-label='Back to top'
					onClick={() => window.scrollTo(0, 0)}>
					<KeyboardArrowUpIcon />
				</Fab>
			</Fade>
		</Box>
	);
};

export default ScrollToTopButton;
