import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ApplicationHead from '../components/ApplicationHead';
import api from '../utils/api';
import _presets from '../utils/presets.json';
import prisma from '../utils/prisma';
import type { BootResponse } from './api/boot';

const presets = _presets.map((p) => ({ id: p.preset_id, name: p.preset_name }));

type Preset = typeof presets[number];

const WelcomePage: NextPage = () => {
	return (
		<>
			<ApplicationHead title='Welcome' />
			<Welcome />
		</>
	);
};

const Welcome: React.FC = () => {
	const [booting, setBooting] = useState(false);
	const [error, setError] = useState<string>();
	const [selectedPreset, setSelectedPreset] = useState(presets[0]);
	const router = useRouter();

	useEffect(() => {
		if (router.query.error === 'true') {
			setError('Não foi possível encontrar um banco de dados.');
		}
	}, [router]);

	if (booting) return null;

	const boot = () => {
		setBooting(true);
		api
			.post<BootResponse>('/boot', { presetId: selectedPreset.id })
			.then(({ data }) => {
				if (data.status === 'success') {
					router.push('/');
					return;
				}

				switch (data.reason) {
					case 'already_booted':
						return setError('O sistema do Rollify já foi inicializado.');
					case 'invalid_preset_id':
						return setError('A predefinição selecionada não existe.');
					default:
						return setError('Ocorreu um erro inesperado: ' + data.reason);
				}
			})
			.catch((err) => {})
			.finally(() => setBooting(false));
	};

	return (
		<Container sx={{ textAlign: 'center' }}>
			{error ? (
				<>
					<Typography variant='h1' gutterBottom color='Highlight'>
						Ocorreu um erro ao inicializar o Rollify.
					</Typography>
					<Typography variant='h4' gutterBottom>
						{error}
					</Typography>
					<Typography variant='body1' gutterBottom>
						Confira se o banco de dados está corretamente vinculado na Heroku e faça o redeploy.
						Caso esse erro persista, contate o(a) administrador(a) do Rollify no{' '}
						<a
							href='https://github.com/alyssapiresfernandescefet/openrpg/issues'
							target='_blank'
							rel='noreferrer'>
							GitHub
						</a>
						.
					</Typography>
				</>
			) : (
				<>
					<Typography variant='h1' gutterBottom>
						Seja bem-vindo ao Rollify!
					</Typography>
					<Typography variant='h4' gutterBottom>
						Para começar, selecione uma predefinição de ficha abaixo:
					</Typography>
					<FormControl fullWidth sx={{ mb: 3 }}>
						<InputLabel id='presetSelectLabel'>Predefinição</InputLabel>
						<Select
							labelId='presetSelectLabel'
							id='presetSelect'
							label='Predefinição'
							value={selectedPreset.id}
							onChange={(ev) =>
								setSelectedPreset(presets.find((p) => p.id === ev.target.value) as Preset)
							}>
							{presets.map((p) => (
								<MenuItem key={p.id} value={p.id}>
									{p.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Button variant='contained' onClick={boot}>
						Aplicar
					</Button>
				</>
			)}
		</Container>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	try {
		const init = (await prisma.config.findUnique({ where: { name: 'init' } }))?.value === 'true';
		if (init)
			return {
				redirect: {
					destination: '/',
					permanent: false,
				},
			};
	} catch (err) {
		return {
			redirect: {
				destination: '/welcome?error=true',
				permanent: false,
			},
		};
	}
    
	return { props: {} };
};

export default WelcomePage;
