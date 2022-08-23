import Box, { BoxProps } from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type SectionProps = BoxProps & {
	title: string;
	children?: React.ReactNode;
	sideButton?: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, children, sideButton, ...props }) => {
	return (
		<Box {...props}>
			<Paper elevation={4}>
				<Box p={2}>
					<Box
						display='flex'
						flexDirection='row'
						textAlign='center'
						sx={{
							'::before': {
								content: '""',
								flex: 1,
							},
							'::after': sideButton
								? undefined
								: {
										content: '""',
										flex: 1,
								  },
						}}>
						<Typography gutterBottom variant='h4' component='h2' textTransform='uppercase'>
							{title}
						</Typography>
						{sideButton && (
							<Box flex='1' textAlign='end'>
								{sideButton}
							</Box>
						)}
					</Box>
					<Divider sx={{ mb: 2 }} />
					{children}
				</Box>
			</Paper>
		</Box>
	);
};

export default Section;
