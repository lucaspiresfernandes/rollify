import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LoadingScreen from '../../components/LoadingScreen';
import useBoot from '../../hooks/useBoot';
import useSession from '../../hooks/useSession';

const ErrorPage: NextPage = () => {
	const boot = useBoot();
	const session = useSession();
	const router = useRouter();

	if (boot) {
		router.push('/');
		return null;
	}

	if (session) {
		if (session.admin) router.push('/admin/main');
		router.push('/sheet/player/1');
		return null;
	}

	if (boot === undefined) return <LoadingScreen />;

	return (
		<>
			<Head>
				<title>Error</title>
			</Head>
			<Container sx={{ textAlign: 'center' }}>
				<Typography variant='h1' gutterBottom>
					TODO: Ocorreu um erro ao inicializar o Rollify.
				</Typography>
				<Typography variant='h4' gutterBottom>
					TODO: Não foi possível encontrar um banco de dados.
				</Typography>
				<Typography variant='body1' gutterBottom>
					TODO: Confira se o banco de dados está corretamente vinculado na Heroku e faça o redeploy.
					Caso esse erro persista, contate o(a) administrador(a) do Rollify no{' '}
					<a
						href='https://github.com/alyssapiresfernandescefet/openrpg/issues'
						target='_blank'
						rel='noreferrer'>
						GitHub
					</a>
					.
				</Typography>
			</Container>
		</>
	);
};

export default ErrorPage;
