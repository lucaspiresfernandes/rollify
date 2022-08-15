import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import Router from 'next/router';
import { useEffect, useMemo } from 'react';
import { ApiContext, SocketContext } from '../../contexts';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import type { SheetSecondPageProps } from '../../pages/sheet/player/2';
import createApiClient from '../../utils/createApiClient';
import PlayerExtraInfoContainer from './PlayerExtraInfoContainer';
import PlayerNotesContainer from './PlayerNotesContainer';

const PlayerSheetPage2: React.FC<SheetSecondPageProps & { isNpc?: boolean }> = (props) => {
	const socket = useSocket(`player${props.player.id}`);
	const { t } = useI18n<Locale>();

	const api = useMemo(
		() =>
			createApiClient({
				transformRequest: [
					(data) => {
						if (props.isNpc) data.npcId = props.player.id;
						return data;
					},
				],
			}),
		[props.player.id, props.isNpc]
	);

	useEffect(() => {
		if (!socket) return;
		socket.on('playerDelete', () => api.delete('/player').then(() => Router.push('/')));
		return () => {
			socket.off('playerDelete');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	return (
		<SocketContext.Provider value={socket}>
			<ApiContext.Provider value={api}>
				<Container sx={{ mt: 2 }}>
					<Box textAlign='center'>
						<Typography variant='h3' component='h1'>
							{t('sheet.playerTitle')}
						</Typography>
					</Box>
					<Grid container spacing={2} my={2}>
						<Grid item xs={12}>
							<PlayerNotesContainer
								title={t('sheet.playerNotesTitle')}
								value={props.player.PlayerNote?.value || ''}
							/>
						</Grid>

						<Grid item xs={12}>
							<PlayerExtraInfoContainer
								title={t('sheet.playerExtraInfoTitle')}
								extraInfo={props.player.PlayerExtraInfo.map((info) => ({
									...info,
									...info.ExtraInfo,
								}))}
							/>
						</Grid>
					</Grid>
				</Container>
			</ApiContext.Provider>
		</SocketContext.Provider>
	);
};

export default PlayerSheetPage2;
