import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { GetServerSidePropsContext, NextPage } from 'next';
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
import type { InferSsrProps } from '../utils/next';
import prisma from '../utils/prisma';
import { withSessionSsr } from '../utils/session';
import type { RegisterResponse } from './api/register';

type RegisterHandler = (email: string, password: string, adminKey?: string) => void;

type PageProps = InferSsrProps<typeof getSsp>;

const HomePage: NextPage<PageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Register - Rollify</title>
			</Head>
			<Home {...props} />
		</>
	);
};

const Home: React.FC<PageProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const { t } = useI18n<Locale>();
	const log = useContext(LoggerContext);

	const onLogin: RegisterHandler = async (email, password, adminKey) => {
		setLoading(true);

		const { data } = await api.post<RegisterResponse>('/register', {
			email,
			password,
			adminKey,
		});

		if (data.status === 'success') {
			if (data.isAdmin) return Router.push('/admin/main');
			return Router.push('/sheet/player/1');
		}

		setLoading(false);

		switch (data.reason) {
			case 'invalid_credentials':
				return log({ text: t('error.credentials.invalid_credentials'), severity: 'error' });
			case 'user_already_exists':
				return log({ text: t('error.credentials.email_already_used'), severity: 'error' });
			case 'invalid_admin_key':
				return log({ text: t('error.credentials.invalid_admin_key'), severity: 'error' });
			default:
				return log({ text: t('error.unknown', { message: data.reason }), severity: 'error' });
		}
	};

	if (loading) return <LoadingScreen />;

	return (
		<Container sx={{ textAlign: 'center' }} maxWidth='sm'>
			<Box mt={6} display='flex' flexDirection='column'>
				<Typography variant='h4' component='h1'>
					{t('register.title')}
				</Typography>
				<RegisterForm
					onSubmit={onLogin}
					firstAdmin={props.firstAdmin}
					registerAsAdmin={props.registerAsAdmin}
				/>
			</Box>
		</Container>
	);
};

type RegisterFormProps = {
	onSubmit: RegisterHandler;
	registerAsAdmin: boolean;
	firstAdmin: boolean;
};

const RegisterForm: React.FC<RegisterFormProps> = (props) => {
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState<string>();
	const [password, setPassword] = useState('');
	const [passwordError, setPasswordError] = useState<string>();
	const [confirmPassword, setConfirmPassword] = useState('');
	const [adminKey, setAdminKey] = useState('');
	const { t } = useI18n<Locale>();

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		if (!EMAIL_REGEX.test(email)) return setEmailError(t('error.credentials.invalid_email'));
		if (!password || !confirmPassword)
			return setPasswordError(t('error.credentials.empty_password'));
		if (password !== confirmPassword)
			return setPasswordError(t('error.credentials.password_mismatch'));
		props.onSubmit(email, password, props.registerAsAdmin ? adminKey : undefined);
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
				label={t('register.password')}
				margin='normal'
				type='password'
				autoComplete='new-password'
				value={password}
				onChange={(ev) => {
					setPassword(ev.target.value);
					setPasswordError(undefined);
				}}
				error={!!passwordError}
				helperText={passwordError}
			/>
			<TextField
				fullWidth
				label={t('register.confirmPassword')}
				margin='normal'
				type='password'
				autoComplete='new-password'
				value={confirmPassword}
				onChange={(ev) => {
					setConfirmPassword(ev.target.value);
					setPasswordError(undefined);
				}}
				error={!!passwordError}
				helperText={passwordError}
			/>
			{props.registerAsAdmin &&
				(props.firstAdmin ? (
					<Typography variant='caption' mt={1}>
						{t('register.adminKeyDisabled')}
					</Typography>
				) : (
					<TextField
						fullWidth
						label={t('register.adminKey')}
						margin='normal'
						autoComplete='off'
						value={adminKey}
						onChange={(ev) => setAdminKey(ev.target.value)}
					/>
				))}
			<Button variant='contained' color='primary' type='submit' fullWidth sx={{ mt: 3, mb: 2 }}>
				{t('register.registerButton')}
			</Button>
			<Grid container>
				<Grid item xs>
					<Link href='/' passHref>
						<MuiLink variant='body2'>{t('register.login')}</MuiLink>
					</Link>
				</Grid>
				<Grid item xs>
					{props.registerAsAdmin ? (
						<Link href='/register' passHref>
							<MuiLink variant='body2'>{t('register.registerAsPlayer')}</MuiLink>
						</Link>
					) : (
						<Link href='/register?admin=true' passHref>
							<MuiLink variant='body2'>{t('register.registerAsAdmin')}</MuiLink>
						</Link>
					)}
				</Grid>
			</Grid>
		</Box>
	);
};

async function getSsp(ctx: GetServerSidePropsContext) {
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

	const registerAsAdmin = ctx.query.admin === 'true';

	let firstAdmin = false;
	if (registerAsAdmin) {
		const admins = await prisma.player.findMany({ where: { role: 'ADMIN' } });
		firstAdmin = admins.length === 0;
	}

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../i18n/${locale}`);
	return { props: { table, registerAsAdmin, firstAdmin } };
}

export const getServerSideProps = withSessionSsr(getSsp);

export default HomePage;
