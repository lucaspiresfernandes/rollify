import SheetContainer from './Section';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import useExtendedState from '../../hooks/useExtendedState';
import { ApiContext, LoggerContext } from '../../contexts';
import { useContext } from 'react';
import { handleDefaultApiResponse } from '../../utils';
import type { PlayerAnnotationApiResponse } from '../../pages/api/sheet/player/annotation';

type PlayerNotesContainerProps = {
	title: string;
	value: string;
};

const PlayerNotesContainer: React.FC<PlayerNotesContainerProps> = (props) => {
	const [value, setValue, isClean] = useExtendedState(props.value);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	const onValueBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isClean()) return;
		api
			.post<PlayerAnnotationApiResponse>('/sheet/player/annotation', { value })
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: err.message }));
	};

	return (
		<SheetContainer title={props.title}>
			<Box py={1}>
				<TextField
					fullWidth
					multiline
					variant='outlined'
					minRows={3}
					inputProps={{
						'aria-label': 'Annotations',
					}}
					value={value}
					onChange={(ev) => setValue(ev.target.value)}
					onBlur={onValueBlur}
				/>
			</Box>
		</SheetContainer>
	);
};

export default PlayerNotesContainer;
