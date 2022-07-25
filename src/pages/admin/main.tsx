import DeleteIcon from '@mui/icons-material/Delete';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import GetPortraitDialog from '../../components/admin/dialogs/GetPortraitDialog';
import PlayerDetailsDialog from '../../components/admin/dialogs/PlayerDetailsDialog';
import UtilitySection from '../../components/admin/dialogs/UtilitySection';
import LoadingScreen from '../../components/LoadingScreen';
import PartialBackdrop from '../../components/PartialBackdrop';
import PlayerNotesContainer from '../../components/sheet/PlayerNotesContainer';
import { LoggerContext, SocketContext } from '../../contexts';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import { getAvatarSize, handleDefaultApiResponse } from '../../utils';
import { api } from '../../utils/createApiClient';
import type { InferSsrProps } from '../../utils/next';
import prisma from '../../utils/prisma';
import { withSessionSsr } from '../../utils/session';
import type { PlayerApiResponse, PlayerApiResponsePlayerData } from '../api/sheet/player';
import type { PlayerGetAvatarApiResponse } from '../api/sheet/player/avatar/[attrStatusID]';

type AdminPanelPageProps = InferSsrProps<typeof getSsp>;

const AdminMainPage: NextPage<AdminPanelPageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Panel</title>
			</Head>
			<AdminMain {...props} />
		</>
	);
};

const AdminMain: React.FC<AdminPanelPageProps> = (props) => {
	const { t } = useI18n<Locale>();
	const socket = useSocket('admin');

	if (!socket) return <LoadingScreen />;

	return (
		<Container sx={{ my: 2 }}>
			<Box textAlign='center'>
				<Typography variant='h3' component='h1'>
					{t('admin.panelTitle')}
				</Typography>
			</Box>

			<SocketContext.Provider value={socket}>
				<PlayerContainer
					players={props.players.map((player) => ({
						id: player.id,
						name: player.name || 'Desconhecido',
						attribute: player.PlayerAttributes.map((attr) => ({
							...attr,
							...attr.Attribute,
						})),
						attributeStatus: player.PlayerAttributeStatus.map((attr) => ({
							...attr,
							...attr.AttributeStatus,
						})),
					}))}
				/>

				<Divider sx={{ my: 3 }} />

				<UtilitySection npcs={props.npcs} players={props.players} />
			</SocketContext.Provider>

			<PlayerNotesContainer
				title={t('sheet.playerNotesTitle')}
				value={props.annotations?.value || ''}
			/>
		</Container>
	);
};

type PlayerContainerProps = {
	players: {
		id: number;
		name: string;
		attribute: {
			id: number;
			name: string;
			color: string;
			value: number;
			maxValue: number;
		}[];
		attributeStatus: {
			id: number;
			value: boolean;
		}[];
	}[];
};

const PlayerContainer: React.FC<PlayerContainerProps> = (props) => {
	const [players, setPlayers] = useState(props.players);
	const [portraitDialogPlayerId, setPortraitDialogPlayerId] = useState<number>();
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const socket = useContext(SocketContext);

	useEffect(() => {
		socket.on('playerNameChange', (id, name) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id === id) return { ...player, name: name || 'Desconhecido' };
					return player;
				})
			);
		});

		socket.on('playerAttributeChange', (id, attrId, value, maxValue) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id !== id) return player;
					return {
						...player,
						attribute: player.attribute.map((attr) => {
							if (attr.id === attrId) return { ...attr, value, maxValue };
							return attr;
						}),
					};
				})
			);
		});

		socket.on('playerAttributeStatusChange', (id, attrId, value) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id !== id) return player;
					return {
						...player,
						attributeStatus: player.attributeStatus.map((attr) => {
							if (attr.id === attrId) return { ...attr, value };
							return attr;
						}),
					};
				})
			);
		});

		return () => {
			socket.off('playerNameChange');
			socket.off('playerAttributeChange');
			socket.off('playerAttributeStatusChange');
		};
	}, [socket]);

	if (players.length === 0)
		return (
			<Typography variant='h5' component='h2' textAlign='center' mt={3} color='GrayText'>
				TODO: Os jogadores cadastrados aparecerão aqui.
			</Typography>
		);

	const showDetails: PlayerFieldProps['onShowDetails'] = (player) => {
		console.log(player);
	};

	return (
		<>
			<Grid container spacing={3} mt={2}>
				{players.map((player) => (
					<Grid item key={player.id} xs={12} md={6} lg={4}>
						<PlayerField
							{...player}
							onShowDetails={showDetails}
							onDeletePlayer={() => setPlayers((p) => p.filter((pl) => pl.id !== player.id))}
							onGetPortrait={() => setPortraitDialogPlayerId(player.id)}
						/>
					</Grid>
				))}
			</Grid>
			<GetPortraitDialog
				open={Boolean(portraitDialogPlayerId)}
				onClose={() => setPortraitDialogPlayerId(undefined)}
				playerId={portraitDialogPlayerId || 0}
			/>
			<PlayerDetailsDialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} />
		</>
	);
};

type PlayerFieldProps = PlayerContainerProps['players'][number] & {
	onShowDetails: (player: PlayerApiResponsePlayerData) => void;
	onGetPortrait: () => void;
	onDeletePlayer: () => void;
};

const PlayerField: React.FC<PlayerFieldProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const log = useContext(LoggerContext);

	const deletePlayer = () => {
		if (!confirm('TODO: Tem certeza que deseja apagar esse jogador?')) return;
		setLoading(true);
		api
			.delete<PlayerApiResponse>('/sheet/player', { data: { id: props.id } })
			.then((res) => {
				if (res.data.status === 'success') return props.onDeletePlayer();
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const showDetails = () => {
		setLoading(true);
		api
			.get<PlayerApiResponse>('/sheet/player', { params: { id: props.id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log);
				props.onShowDetails(res.data.player);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	return (
		<Box
			display='flex'
			gap={2}
			alignItems='center'
			position='relative'
			borderRadius={2}
			border='1px solid darkgray'
			p={1}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<PlayerAvatarField id={props.id} status={props.attributeStatus} />
			<Box display='flex' flexDirection='column' gap={1}>
				<Typography variant='h5' component='h2'>
					{props.name}
				</Typography>
				<div>
					{props.attribute.map((attr) => (
						<Box key={attr.id} sx={{ color: `#${attr.color}` }}>
							<Typography variant='body1'>
								{attr.name}: {attr.value}/{attr.maxValue}
							</Typography>
						</Box>
					))}
				</div>
				<Box display='flex' gap={1}>
					<Tooltip title='TODO: Detalhes' describeChild>
						<Button variant='outlined' size='small' onClick={showDetails}>
							<OpenInFullIcon />
						</Button>
					</Tooltip>
					<Tooltip title='TODO: Retrato' describeChild>
						<Button variant='outlined' size='small' onClick={props.onGetPortrait}>
							<VideoCameraFrontIcon />
						</Button>
					</Tooltip>
					<Tooltip title='TODO: Excluir' describeChild>
						<Button variant='outlined' size='small' onClick={deletePlayer}>
							<DeleteIcon />
						</Button>
					</Tooltip>
				</Box>
			</Box>
		</Box>
	);
};

const AVATAR_SIZE = getAvatarSize(0.25);

type PlayerAvatarFieldProps = {
	id: number;
	status: { id: number; value: boolean }[];
};

const PlayerAvatarField: React.FC<PlayerAvatarFieldProps> = (props) => {
	const [src, setSrc] = useState('/avatar404.png');
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		let statusId = 0;
		for (const stat of props.status) {
			if (stat.value) {
				statusId = stat.id;
				break;
			}
		}
		if (statusId === previousStatusID.current) return;
		previousStatusID.current = statusId;
		api
			.get<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${statusId}`, {
				params: { playerID: props.id },
			})
			.then(({ data }) => {
				if (data.status === 'success') {
					setSrc(data.link);
					return;
				}
				setSrc('/avatar404.png');
			})
			.catch(() => setSrc('/avatar404.png'));
	}, [props]);

	return (
		<div>
			<Avatar
				sx={{
					width: AVATAR_SIZE[0],
					height: AVATAR_SIZE[1],
					backgroundColor: 'transparent',
				}}>
				<Image
					src={src}
					alt='Character Avatar'
					width={AVATAR_SIZE[0]}
					height={AVATAR_SIZE[1]}
					onError={() => setSrc('/avatar404.png')}
				/>
			</Avatar>
		</div>
	);
};

async function getSsp(ctx: GetServerSidePropsContext) {
	const player = ctx.req.session.player;
	if (!player || !player.admin) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	const results = await prisma.$transaction([
		prisma.player.findMany({
			where: { role: 'PLAYER' },
			select: {
				id: true,
				name: true,
				PlayerAttributeStatus: {
					select: { AttributeStatus: { select: { id: true } }, value: true },
				},
				PlayerAttributes: {
					select: {
						Attribute: { select: { id: true, name: true, color: true } },
						value: true,
						maxValue: true,
					},
				},
			},
		}),
		prisma.player.findMany({
			where: { role: 'NPC' },
			select: { id: true, name: true },
		}),
		prisma.config.findUnique({ where: { name: 'environment' } }),
		prisma.playerNote.findUnique({
			where: { player_id: player.id },
			select: { value: true },
		}),
	]);

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../../i18n/${locale}`);

	return {
		props: {
			players: results[0],
			npcs: results[1],
			environment: results[2],
			annotations: results[3],
			table,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default AdminMainPage;
