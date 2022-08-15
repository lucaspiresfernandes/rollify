import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useState } from 'react';
import { ChromePicker, ColorChangeHandler } from 'react-color';

type ColorFieldProps = Omit<TextFieldProps, 'color'> & {
	color: string;
	onColorChange: ColorChangeHandler;
};

const ColorField: React.FC<ColorFieldProps> = ({ color, onColorChange, ...props }) => {
	const [openColorPicker, setOpenColorPicker] = useState(false);
	const theme = useTheme();

	return (
		<Box position='relative'>
			<TextField
				autoComplete='off'
				value={color}
				disabled
				{...props}
				onClick={(ev) => {
					props.onClick && props.onClick(ev);
					setOpenColorPicker(true);
				}}
			/>
			<Box
				position='absolute'
				top='50%'
				right={0}
				width={20}
				height={20}
				borderRadius={0.5}
				sx={{ backgroundColor: color, transform: 'translate(-50%, -50%)' }}
				onClick={() => setOpenColorPicker(true)}
			/>
			<Fade in={openColorPicker}>
				<Box position='absolute' top='105%' zIndex={theme.zIndex.modal}>
					<Box
						position='fixed'
						top={0}
						right={0}
						bottom={0}
						left={0}
						onClick={() => setOpenColorPicker(false)}
					/>
					<Box position='fixed'>
						<ChromePicker disableAlpha color={color} onChange={onColorChange} />
					</Box>
				</Box>
			</Fade>
		</Box>
	);
};

export default ColorField;
