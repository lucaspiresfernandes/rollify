import SheetContainer from '../../components/sheet/Container';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import useExtendedState from '../../hooks/useExtendedState';
import { ApiContext, LoggerContext } from '../../contexts';
import { useContext } from 'react';
import { handleDefaultApiResponse } from '../../utils';
import type { PlayerExtraInfoApiResponse } from '../../pages/api/sheet/player/extrainfo';

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

	const onValueBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isClean()) return;
		api
			.post<PlayerExtraInfoApiResponse>('/sheet/player/extrainfo', { id: props.id, value })
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: err.message }));
	};

	return (
		<TextField
			fullWidth
			multiline
			variant='outlined'
			label={props.name}
			minRows={3}
			inputProps={{
				'aria-label': 'Annotations',
			}}
			value={value}
			onChange={(ev) => setValue(ev.target.value)}
			onBlur={onValueBlur}
		/>
	);
};

export default PlayerExtraInfoContainer;
