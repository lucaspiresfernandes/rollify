import Box, { BoxProps } from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
	border: '1px solid gray',
	borderRadius: (theme.shape.borderRadius as number) * 2,
	paddingRight: 8,
	paddingLeft: 8,
}));

type SectionProps = BoxProps & {
	title: string;
	children?: React.ReactNode;
	sideButton?: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, children, sideButton, ...props }) => {
	return (
		<StyledBox {...props}>
			<Box
				display='flex'
				flexDirection='row'
				textAlign='center'
				my={1}
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
				<Typography variant='h4' component='h2'>
					{title}
				</Typography>
				{sideButton && (
					<Box flex='1' textAlign='end'>
						{sideButton}
					</Box>
				)}
			</Box>
			<Divider />
			{children}
		</StyledBox>
	);
};

export default Section;
