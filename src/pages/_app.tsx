import type { EmotionCache } from '@emotion/react';
import { CacheProvider } from '@emotion/react';
import type { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { I18nProvider } from 'next-rosetta';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { PaletteModeContext } from '../contexts';
import '../styles/globals.css';
import getTheme from '../theme';
import createEmotionCache from '../utils/createEmotionCache';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type MyAppProps = AppProps & {
	emotionCache?: EmotionCache;
};

export default function MyApp(props: MyAppProps) {
	const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
	const [mode, setMode] = useState<PaletteMode>('dark');

	useEffect(() => {
		setMode((localStorage.getItem('theme') || 'dark') as PaletteMode);
	}, []);

	const toggleMode = () => {
		setMode((m) => {
			const newMode = m === 'light' ? 'dark' : 'light';
			localStorage.setItem('theme', newMode);
			return newMode;
		});
	};

	const theme = getTheme(mode);

	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<meta name='theme-color' content={theme.palette.primary.main} />
				<meta name='viewport' content='initial-scale=1, width=device-width' />
			</Head>
			<PaletteModeContext.Provider value={{ mode, toggleMode }}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<I18nProvider table={pageProps.table}>
						<Component {...pageProps} />
					</I18nProvider>
				</ThemeProvider>
			</PaletteModeContext.Provider>
		</CacheProvider>
	);
}
