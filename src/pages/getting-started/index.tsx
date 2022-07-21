import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import ApplicationHead from '../../components/ApplicationHead';
import LoadingScreen from '../../components/LoadingScreen';
import { api } from '../../utils/createApiClient';
import type { Presets } from '../../utils/presets';
import preset_en from '../../utils/presets/en.json';
import preset_pt from '../../utils/presets/pt-BR.json';
import prisma from '../../utils/prisma';
import type { BootResponse } from '../api/boot';

type Preset = Presets[number];
const presetsMap = new Map<string, Presets>([
	['en', preset_en as Presets],
	['pt-BR', preset_pt as Presets],
]);

const GettingStartedPage: NextPage = (props) => {
	return (
		<>
			<ApplicationHead title='Getting Started' />
			<GettingStarted />
		</>
	);
};

const GettingStarted: React.FC = () => {
	const [booting, setBooting] = useState(false);
	const [error, setError] = useState<string>();
	const [selectedPresetId, setSelectedPresetId] = useState('none');
	const router = useRouter();
	const presets = useMemo(
		() => (presetsMap.get(router.locale || 'en') || preset_en) as Presets,
		[router]
	);

	if (booting) return <LoadingScreen />;

	const boot = () => {
		setBooting(true);
		api
			.post<BootResponse>('/boot', { presetId: selectedPresetId, locale: router.locale })
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
					case 'invalid_locale':
						return setError('O idioma selecionado não existe.');
					default:
						return setError('Ocorreu um erro inesperado: ' + data.reason);
				}
			})
			.catch((err) => setError('Ocorreu um erro inesperado: ' + err.message))
			.finally(() => setBooting(false));
	};

	return (
		<Container sx={{ textAlign: 'center', mt: 3 }}>
			{error ? (
				<>
					<Typography variant='h3' component='h1' gutterBottom color='Highlight'>
						Ocorreu um erro ao inicializar o Rollify.
					</Typography>
					<Typography variant='h4' component='h2' gutterBottom>
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
					<Typography variant='h3' component='h1' gutterBottom>
						Seja bem-vindo ao Rollify!
					</Typography>
					<Typography variant='h5' component='h2' gutterBottom>
						Para começar, selecione uma predefinição de ficha abaixo:
					</Typography>
					<FormControl fullWidth sx={{ mb: 3 }}>
						<InputLabel id='presetSelectLabel'>Predefinição</InputLabel>
						<Select
							labelId='presetSelectLabel'
							id='presetSelect'
							label='Predefinição'
							value={selectedPresetId}
							onChange={(ev) => {
								const p = presets.find((p) => p.preset_id === ev.target.value) as Preset;
								setSelectedPresetId(p.preset_id);
							}}>
							{presets.map((p) => (
								<MenuItem key={p.preset_id} value={p.preset_id}>
									{p.preset_name}
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
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
				destination: '/getting-started/error',
				permanent: false,
			},
		};
	}

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../../i18n/${locale}`);

	return { props: { table } };
}

export default GettingStartedPage;
