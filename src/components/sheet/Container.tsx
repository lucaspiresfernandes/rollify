import Box, { BoxProps } from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

type ContainerProps = {
	title: string;
	children?: React.ReactNode;
	addButton?: React.ReactNode;
	containerProps?: BoxProps;
};

const Container: React.FC<ContainerProps> = (props) => {
	return (
		<Box px={1} {...props.containerProps} border='1px solid gray' borderRadius={2}>
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
				}}>
				<Typography variant='h4' component='h2'>
					{props.title}
				</Typography>
				<Box flex='1' textAlign='end'>
					{props.addButton}
				</Box>
			</Box>
			<Divider />
			{props.children}
		</Box>
	);
};

export default Container;
