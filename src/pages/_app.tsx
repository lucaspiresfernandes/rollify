import type { EmotionCache } from '@emotion/react';
import { CacheProvider } from '@emotion/react';
import type { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { I18nProvider } from 'next-rosetta';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import ScrollToTopButton from '../components/ScrollToTopButton';
import SnackbarContainer from '../components/SnackbarContainer';
import { LoggerContext } from '../contexts';
import useSnackbar from '../hooks/useSnackbar';
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
	const [mode, setMode] = useState<PaletteMode | 'system'>('dark');
	const [snackbarProps, updateSnackbar] = useSnackbar();

	useEffect(() => {
		setMode((localStorage.getItem('theme') || 'dark') as PaletteMode);
	}, []);

	const theme = useMemo(() => {
		let newMode = mode;
		if (newMode === 'system') {
			if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) newMode = 'dark';
			else newMode = 'light';
		}
		return getTheme(newMode);
	}, [mode]);

	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<meta name='theme-color' content={theme.palette.primary.main} />
				<meta name='viewport' content='initial-scale=1, width=device-width' />
				<meta
					name='description'
					content='Powered by Rollify. Learn more at https://github.com/alyssapiresfernandescefet/openrpg'
				/>
				<meta name='author' content='Alyssa Fernandes' />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<I18nProvider table={pageProps.table}>
					<LoggerContext.Provider value={updateSnackbar}>
						<Navbar mode={mode} updateMode={setMode} />
						<Component {...pageProps} />
						<ScrollToTopButton />
					</LoggerContext.Provider>
					<SnackbarContainer {...snackbarProps} />
				</I18nProvider>
			</ThemeProvider>
		</CacheProvider>
	);
}
