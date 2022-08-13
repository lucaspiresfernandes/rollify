import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Zoom from '@mui/material/Zoom';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import { startTransition, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ScrollToTopButton: React.FC = () => {
	const [visible, setVisible] = useState(false);
	const router = useRouter();

	const scrollEvent = useCallback(() => startTransition(() => setVisible(window.scrollY > 0)), []);

	useEffect(() => {
		if (router.pathname.includes('/portrait')) return;
		document.addEventListener('scroll', scrollEvent);
		return () => {
			document.removeEventListener('scroll', scrollEvent);
		};
	}, [router, scrollEvent]);

	if (router.pathname.includes('/portrait')) return null;

	return (
		<Box position='fixed' bottom={24} right={20}>
			<Zoom in={visible}>
				<Fab
					size='small'
					color='primary'
					aria-label='Back to top'
					onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
					<KeyboardArrowUpIcon />
				</Fab>
			</Zoom>
		</Box>
	);
};

export default ScrollToTopButton;
