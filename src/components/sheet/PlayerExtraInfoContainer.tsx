import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { useContext } from 'react';
import { ApiContext, LoggerContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { PlayerExtraInfoApiResponse } from '../../pages/api/sheet/player/extrainfo';
import { handleDefaultApiResponse } from '../../utils';
import SheetContainer from './Section';

type PlayerExtraInfoContainerProps = {
	title: string;
	extraInfo: {
		id: number;
		name: string;
		value: string;
	}[];
};

const PlayerExtraInfoContainer: React.FC<PlayerExtraInfoContainerProps> = (props) => {
	return (
		<SheetContainer title={props.title}>
			<Box display='flex' flexDirection='column' gap={3} py={2}>
				{props.extraInfo.map((info) => (
					<PlayerExtraInfoField key={info.id} {...info} />
				))}
			</Box>
		</SheetContainer>
	);
};

type PlayerExtraInfoFieldProps = {
	id: number;
	name: string;
	value: string;
};

const PlayerExtraInfoField: React.FC<PlayerExtraInfoFieldProps> = (props) => {
	const [value, setValue, isClean] = useExtendedState(props.value);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const onValueBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isClean()) return;
		api
			.post<PlayerExtraInfoApiResponse>('/sheet/player/extrainfo', { id: props.id, value })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<TextField
			fullWidth
			multiline
			variant='outlined'
			label={props.name}
			minRows={3}
			value={value}
			onChange={(ev) => setValue(ev.target.value)}
			onBlur={onValueBlur}
		/>
	);
};

export default PlayerExtraInfoContainer;
