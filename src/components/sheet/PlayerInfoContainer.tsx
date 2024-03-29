import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { startTransition, useContext, useState } from 'react';
import { ApiContext, LoggerContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { PlayerApiResponse } from '../../pages/api/sheet/player';
import type { PlayerInfoApiResponse } from '../../pages/api/sheet/player/info';
import { handleDefaultApiResponse } from '../../utils';
import SheetContainer from './Section';

type PlayerInfoContainerProps = {
	title: string;
	playerName: {
		value: string;
		show: boolean;
	};
	playerInfo: {
		id: number;
		name: string;
		value: string;
	}[];
	playerSpec: {
		id: number;
		name: string;
		value: string;
	}[];
};

const PlayerInfoContainer: React.FC<PlayerInfoContainerProps> = (props) => {
	return (
		<SheetContainer title={props.title}>
			<Stack spacing={3} pt={3}>
				<PlayerNameField {...props.playerName} />
				{props.playerInfo.map((info) => (
					<PlayerInfoField key={info.id} {...info} />
				))}
			</Stack>
			<Divider sx={{ my: 2 }} />
			<Grid container spacing={3} justifyContent='center'>
				{props.playerSpec.map((spec) => (
					<Grid item key={spec.id} md={4} xs={6}>
						<PlayerSpecField {...spec} />
					</Grid>
				))}
			</Grid>
		</SheetContainer>
	);
};

type PlayerNameFieldProps = PlayerInfoContainerProps['playerName'];

const PlayerNameField: React.FC<PlayerNameFieldProps> = (props) => {
	const [show, setShow] = useState(props.show);
	const [value, setValue, isClean] = useExtendedState(props.value);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const onShowChange = () => {
		const newShow = !show;
		setShow(newShow);
		api
			.post<PlayerApiResponse>('/sheet/player', {
				showName: newShow,
			})
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const onValueBlur = () => {
		if (isClean()) return;
		api
			.post<PlayerApiResponse>('/sheet/player', { name: value })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<TextField
			variant='outlined'
			label={t('name')}
			autoComplete='off'
			defaultValue={value}
			onChange={(ev) => startTransition(() => setValue(ev.target.value))}
			onBlur={onValueBlur}
			InputProps={{
				startAdornment: (
					<InputAdornment position='start'>
						<IconButton onClick={onShowChange} title={show ? t('hide') : t('show')}>
							{show ? <VisibilityIcon /> : <VisibilityOffIcon />}
						</IconButton>
					</InputAdornment>
				),
			}}
		/>
	);
};

type PlayerInfoFieldProps = PlayerInfoContainerProps['playerInfo'][number];

const PlayerInfoField: React.FC<PlayerInfoFieldProps> = (props) => {
	const [value, setValue, isClean] = useExtendedState(props.value);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const onValueBlur = () => {
		if (isClean()) return;
		api
			.post<PlayerInfoApiResponse>('/sheet/player/info', {
				id: props.id,
				value,
			})
			.then(({ data }) => {
				if (data.status === 'success') return;

				switch (data.reason) {
					case 'invalid_body':
						return log({ severity: 'error', text: 'Invalid body' });
					case 'unauthorized':
						return log({ severity: 'error', text: 'Unauthorized' });
					default:
						return log({ severity: 'error', text: 'Unknown error: ' + data.reason });
				}
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<TextField
			variant='outlined'
			size='small'
			label={props.name}
			autoComplete='off'
			value={value}
			onChange={(ev) => setValue(ev.target.value)}
			onBlur={onValueBlur}
		/>
	);
};

type PlayerSpecFieldProps = {
	id: number;
	name: string;
	value: string;
};

const PlayerSpecField: React.FC<PlayerSpecFieldProps> = (props) => {
	const [value, setValue, isClean] = useExtendedState(props.value);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const onValueBlur = () => {
		if (isClean()) return;
		api
			.post('/sheet/player/spec', { id: props.id, value })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<TextField
			variant='outlined'
			label={props.name}
			fullWidth
			value={value}
			name={`diceUtil${props.name.substring(0, 3).toUpperCase()}`}
			onChange={(ev) => setValue(ev.target.value)}
			autoComplete='off'
			onBlur={onValueBlur}
		/>
	);
};

export default PlayerInfoContainer;
