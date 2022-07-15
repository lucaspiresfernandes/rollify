import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { GetStaticProps, NextPage } from 'next';
import { I18nProps, useI18n } from 'next-rosetta';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { Locale } from '../../i18n';
import { EMAIL_REGEX } from '../../utils';

type ConfirmRecoverHandler = (email: string) => void;

const RecoverPage: NextPage = () => {
	const { t } = useI18n<Locale>();

	return (
		<>
			<Head>
				<title>{t('recover.title')}</title>
			</Head>
			<Recover />
		</>
	);
};

const Recover: React.FC = () => {
	const { t } = useI18n<Locale>();

	const onRecover: ConfirmRecoverHandler = (email) => {};

	return (
		<Container sx={{ textAlign: 'center' }} maxWidth='sm'>
			<Box sx={{ mt: 6, display: 'flex', flexDirection: 'column' }}>
				<Typography variant='h4' component='h1'>
					{t('recover.title')}
				</Typography>
				<RecoverForm onSubmit={onRecover} />
			</Box>
		</Container>
	);
};

const RecoverForm: React.FC<{ onSubmit: ConfirmRecoverHandler }> = (props) => {
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
		</Box>
	);
};

export const getStaticProps: GetStaticProps<I18nProps<Locale>> = async (context) => {
	const locale = context.locale || context.defaultLocale;
	const { table = {} } = await import(`../../i18n/${locale}`); // Import locale
	return { props: { table } }; // Passed to `/pages/_app.tsx`
};

export default RecoverPage;
