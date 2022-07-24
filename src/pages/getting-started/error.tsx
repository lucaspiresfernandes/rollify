import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import ApplicationHead from '../../components/ApplicationHead';
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
			<ApplicationHead title='Error' />
			<Container sx={{ textAlign: 'center' }}>
				<Typography variant='h1' gutterBottom>
					Ocorreu um erro ao inicializar o Rollify.
				</Typography>
				<Typography variant='h4' gutterBottom>
					Não foi possível encontrar um banco de dados.
				</Typography>
				<Typography variant='body1' gutterBottom>
					Confira se o banco de dados está corretamente vinculado na Heroku e faça o redeploy. Caso
					esse erro persista, contate o(a) administrador(a) do Rollify no{' '}
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
