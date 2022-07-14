import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const themeOptions: ThemeOptions = {
	palette: {
		primary: {
			main: '#556cd6',
		},
		secondary: {
			main: '#19857b',
		},
		error: {
			main: red.A400,
		},
	},
};

// Create a theme instance.
const theme = createTheme(themeOptions);

export default theme;
