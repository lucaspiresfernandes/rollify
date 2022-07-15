import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { GetStaticProps, NextPage } from 'next';
import { I18nProps, useI18n } from 'next-rosetta';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { Locale } from '../../i18n';
import { EMAIL_REGEX } from '../../utils';

type RequestRecoverHandler = (email: string) => void;

const RequestRecoverPage: NextPage = () => {
	const { t } = useI18n<Locale>();

	return (
		<>
			<Head>
				<title>{t('recover.title')}</title>
			</Head>
			<RequestRecover />
		</>
	);
};

const RequestRecover: React.FC = () => {
	const [emailSent, setEmailSent] = useState(false);
	const { t } = useI18n<Locale>();

	const onRecoverRequest: RequestRecoverHandler = (email) => {
		setEmailSent(true);
	};

	return (
		<Container sx={{ textAlign: 'center' }} maxWidth='sm'>
			<Box sx={{ mt: 6, display: 'flex', flexDirection: 'column' }}>
				<Typography variant='h4' component='h1'>
					{t('recover.title')}
				</Typography>
				{emailSent ? (
					<>
						Se esse e-mail está registrado, você receberá um link de recuperação de senha no seu
						inbox em alguns minutos. Não se esqueça de checar a caixa de spam.
					</>
				) : (
					<RequestRecoverForm onSubmit={onRecoverRequest} />
				)}
			</Box>
		</Container>
	);
};

const RequestRecoverForm: React.FC<{ onSubmit: RequestRecoverHandler }> = (props) => {
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState<string>();
	const { t } = useI18n<Locale>();
	const router = useRouter();

	useEffect(() => {
		if (router.isReady) {
			const { email } = router.query;
			if (email) setEmail(email as string);
		}
	}, [router]);

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		if (!EMAIL_REGEX.test(email)) return setEmailError(t('error.credentials.invalid_email'));

		props.onSubmit(email);
	};

	return (
		<Box component='form' sx={{ mt: 1 }} onSubmit={handleSubmit}>
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
			<Button variant='contained' color='primary' type='submit' fullWidth sx={{ mt: 3, mb: 2 }}>
				{t('recover.recoverButton')}
			</Button>
			<Link href='/' passHref>
				<MuiLink variant='body2'>{t('recover.login')}</MuiLink>
			</Link>
		</Box>
	);
};

export const getStaticProps: GetStaticProps<I18nProps<Locale>> = async (context) => {
	const locale = context.locale || context.defaultLocale;
	const { table = {} } = await import(`../../i18n/${locale}`); // Import locale
	return { props: { table } }; // Passed to `/pages/_app.tsx`
};

export default RequestRecoverPage;
