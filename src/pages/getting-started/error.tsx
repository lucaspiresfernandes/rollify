import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import ApplicationHead from '../../components/ApplicationHead';

const ErrorPage: NextPage = () => {
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