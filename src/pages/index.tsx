import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { useContext, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';

import { LoggerContext } from '../contexts';
import type { Locale } from '../i18n';
import { EMAIL_REGEX } from '../utils';
import { api } from '../utils/createApiClient';
import prisma from '../utils/prisma';
import { withSessionSsr } from '../utils/session';
import type { LoginResponse } from './api/login';

type LoginHandler = (username: string, password: string) => void;

const HomePage: NextPage = () => {
	return (
		<>
			<Head>
				<title>Login</title>
			</Head>
			<Home />
		</>
	);
};

const Home: React.FC = () => {
	const { t } = useI18n<Locale>();
	const [loading, setLoading] = useState(false);
	const log = useContext(LoggerContext);

	const onLogin: LoginHandler = async (email, password) => {
		setLoading(true);

		const { data } = await api.post<LoginResponse>('/login', { email, password });

		if (data.status === 'success') {
			if (data.isAdmin) return Router.push('/admin/main');
			return Router.push('/sheet/player/1');
		}

		setLoading(false);

		switch (data.reason) {
			case 'invalid_email_or_password':
				return log({ severity: 'error', text: t('error.credentials.invalid_credentials') });
			default:
				return log({ text: t('error.unknown', { message: data.reason }), severity: 'error' });
		}
	};

	if (loading) return <LoadingScreen />;

	return (
		<Container sx={{ textAlign: 'center' }} maxWidth='sm'>
			<Box mt={6} display='flex' flexDirection='column'>
				<Typography variant='h4' component='h1'>
					{t('login.title')}
				</Typography>
				<LoginForm onSubmit={onLogin} />
			</Box>
		</Container>
	);
};

const LoginForm: React.FC<{ onSubmit: LoginHandler }> = (props) => {
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState<string>();
	const [password, setPassword] = useState('');
	const [passwordError, setPasswordError] = useState<string>();
	const { t } = useI18n<Locale>();

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		if (!EMAIL_REGEX.test(email)) return setEmailError(t('error.credentials.invalid_email'));
		if (!password) return setPasswordError(t('error.credentials.empty_password'));

		props.onSubmit(email, password);
	};

	return (
		<Box component='form' mt={1} onSubmit={handleSubmit}>
			<TextField
				fullWidth
				label='Email'
				margin='normal'
				autoComplete='email'
				value={email}
				onChange={(ev) => {
					setEmail(ev.target.value);
					setEmailError(undefined);
				}}
				error={!!emailError}
				helperText={emailError}
			/>
			<TextField
				fullWidth
				label={t('login.password')}
				margin='normal'
				type='password'
				autoComplete='current-password'
				value={password}
				onChange={(ev) => {
					setPassword(ev.target.value);
					setPasswordError(undefined);
				}}
				error={!!passwordError}
				helperText={passwordError}
			/>
			<Button variant='contained' color='primary' type='submit' fullWidth sx={{ mt: 3, mb: 2 }}>
				{t('login.loginButton')}
			</Button>
			<Link href='/register' passHref>
				<MuiLink variant='body2'>{t('login.register')}</MuiLink>
			</Link>
		</Box>
	);
};

export const getServerSideProps = withSessionSsr(async (ctx) => {
	try {
		const init = (await prisma.config.findUnique({ where: { name: 'init' } }))?.value === 'true';
		if (!init)
			return {
				redirect: {
					destination: '/getting-started',
					permanent: false,
				},
			};
	} catch (err) {
		return {
			redirect: {
				destination: '/getting-started/error',
				permanent: false,
			},
		};
	}

	const player = ctx.req.session.player;

	if (player) {
		if (player.admin) {
			return {
				redirect: {
					destination: '/admin/main',
					permanent: false,
				},
			};
		}
		return {
			redirect: {
				destination: '/sheet/player/1',
				permanent: false,
			},
		};
	}

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../i18n/${locale}`);
	return { props: { table } };
});

export default HomePage;
