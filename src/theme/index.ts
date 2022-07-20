import type { PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';

export default function getTheme(mode: PaletteMode) {
	return createTheme({
		palette: {
			mode,
			background: {
				default: mode === 'light' ? '#fafafa' : '#151d27',
			},
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
	});
}
