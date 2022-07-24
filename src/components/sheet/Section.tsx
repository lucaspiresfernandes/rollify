import type { SxProps, Theme } from '@mui/material';
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

type SectionProps = {
	title: string;
	children?: React.ReactNode;
	sideButton?: React.ReactNode;
	sx?: SxProps<Theme>;
};

const Section: React.FC<SectionProps> = (props) => {
	return (
		<StyledBox sx={props.sx}>
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
					'::after': props.sideButton
						? undefined
						: {
								content: '""',
								flex: 1,
						  },
				}}>
				<Typography variant='h4' component='h2'>
					{props.title}
				</Typography>
				{props.sideButton && (
					<Box flex='1' textAlign='end'>
						{props.sideButton}
					</Box>
				)}
			</Box>
			<Divider />
			{props.children}
		</StyledBox>
	);
};

export default Section;
