import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import Router from 'next/router';
import { useEffect, useMemo } from 'react';
import { ApiContext } from '../../contexts';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import type { SheetSecondPageProps } from '../../pages/sheet/player/2';
import createApiClient from '../../utils/createApiClient';
import PlayerExtraInfoContainer from './PlayerExtraInfoContainer';
import PlayerNotesContainer from './PlayerNotesContainer';

const PlayerSheetPage2: React.FC<SheetSecondPageProps & { isNpc: boolean }> = (props) => {
	const socket = useSocket(`player${props.player.id}`);
	const { t } = useI18n<Locale>();

	const api = useMemo(
		() => createApiClient(props.isNpc ? { params: { npcId: props.player.id } } : undefined),
		[props.isNpc, props.player.id]
	);

	useEffect(() => {
		if (!socket) return;
		socket.on('playerDelete', () => Router.push('/'));
		return () => {
			socket.off('playerDelete');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	return (
		<Container sx={{ mt: 2 }}>
			<Typography variant='h3' component='h1' textAlign='center'>
				{t('sheet.playerTitle')}
			</Typography>
			<ApiContext.Provider value={api}>
				<Grid container spacing={2} py={2}>
					<Grid item xs={12}>
						<PlayerNotesContainer
							title={t('sheet.playerNotesTitle')}
							value={props.player.PlayerNote?.value || ''}
						/>
					</Grid>

					<Grid item xs={12}>
						<PlayerExtraInfoContainer
							title={props.section.info}
							extraInfo={props.player.PlayerExtraInfo.map((info) => ({
								...info,
								...info.ExtraInfo,
							}))}
						/>
					</Grid>
				</Grid>
			</ApiContext.Provider>
		</Container>
	);
};

export default PlayerSheetPage2;
