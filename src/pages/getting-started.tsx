import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { GetStaticProps, NextPage } from 'next';
import { I18nProps, useI18n } from 'next-rosetta';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import useBoot from '../hooks/useBoot';
import useSession from '../hooks/useSession';
import type { Locale } from '../i18n';
import { api } from '../utils/createApiClient';
import type { Presets } from '../utils/presets';
import preset_en from '../utils/presets/en.json';
import preset_pt from '../utils/presets/pt-BR.json';
import type { BootApiResponse } from './api/boot';

type Preset = Presets[number];
const presetsMap = new Map<string, Presets>([
	['en', preset_en as Presets],
	['pt-BR', preset_pt as Presets],
]);

const GettingStartedPage: NextPage = () => {
	const boot = useBoot();
	const session = useSession();
	const router = useRouter();

	useEffect(() => {
		if (boot) router.push('/');
	}, [boot, router]);

	useEffect(() => {
		if (session) {
			if (session.admin) router.push('/admin/main');
			router.push('/sheet/player/1');
		}
	}, [session, router]);

	return (
		<>
			<Head>
				<title>Getting Started - Rollify</title>
			</Head>
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
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (router.query.error) setError(router.query.reason as string);
	}, [router.query.error, router.query.reason]);

	if (booting) return <LoadingScreen />;

	const boot = () => {
		setBooting(true);
		api
			.post<BootApiResponse>('/boot', { presetId: selectedPresetId, locale: router.locale })
			.then(({ data }) => {
				if (data.status === 'success') {
					router.push('/');
					return;
				}

				setBooting(false);
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
			.catch((err) => {
				setBooting(false);
				setError('Ocorreu um erro inesperado: ' + err.message);
			});
	};

	return (
		<Container sx={{ textAlign: 'center', mt: 3 }}>
			{error ? (
				<>
					<Typography variant='h3' component='h1' gutterBottom color='Highlight'>
						{t('error.boot.title')}
					</Typography>
					<Typography variant='h4' component='h2' gutterBottom>
						{error}
					</Typography>
					<Typography variant='body1' gutterBottom>
						{t('error.boot.helper')}
					</Typography>
				</>
			) : (
				<>
					<Typography variant='h3' component='h1' gutterBottom>
						{'boot.title'}
					</Typography>
					<Typography variant='h5' component='h2' gutterBottom>
						{'boot.selectPreset'}
					</Typography>
					<FormControl fullWidth sx={{ mb: 3 }}>
						<InputLabel id='presetSelectLabel'>{t('preset')}</InputLabel>
						<Select
							labelId='presetSelectLabel'
							id='presetSelect'
							label={t('preset')}
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
						{t('modal.apply')}
					</Button>
				</>
			)}
		</Container>
	);
};

export const getStaticProps: GetStaticProps<I18nProps<Locale>> = async (ctx) => {
	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../i18n/${locale}`);
	return { props: { table } };
};

export default GettingStartedPage;
