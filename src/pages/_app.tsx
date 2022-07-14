import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import theme from '../theme';
import createEmotionCache from '../utils/createEmotionCache';
import Head from 'next/head';
import { I18nProvider } from 'next-rosetta';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type MyAppProps = AppProps & {
	emotionCache?: EmotionCache;
};

export default function MyApp(props: MyAppProps) {
	const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<meta name='viewport' content='initial-scale=1, width=device-width' />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<I18nProvider table={pageProps.table}>
					<Component {...pageProps} />
				</I18nProvider>
			</ThemeProvider>
		</CacheProvider>
	);
}
