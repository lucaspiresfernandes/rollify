import type { PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';

export default function getTheme(mode: PaletteMode) {
	return createTheme({
		palette: {
			mode,
			primary: {
				main: '#6d65d7',
			},
			secondary: {
				main: '#3f51b5',
			},
		},
		// typography: {
		// 	fontFamily: 'FantaisieArtistique',
		// 	fontSize: 18,
		// },
		// components: {
		// 	MuiAppBar: {
		// 		styleOverrides: {
		// 			colorPrimary: {
		// 				backgroundColor: mode === 'light' ? '#4D2E87' : undefined,
		// 			},
		// 		},
		// 	},
		// },
	});
}
