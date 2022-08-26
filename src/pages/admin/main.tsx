import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import CharacterContainer from '../../components/admin/CharacterContainer';
import EnvironmentField from '../../components/admin/EnvironmentField';
import PlayerNotesContainer from '../../components/sheet/PlayerNotesContainer';
import { SocketContext } from '../../contexts';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import type { DiceConfig } from '../../utils/dice';
import type { InferSsrProps } from '../../utils/next';
import type { Environment } from '../../utils/portrait';
import prisma from '../../utils/prisma';
import { withSessionSsr } from '../../utils/session';

type AdminPanelPageProps = InferSsrProps<typeof getSsp>;

const AdminMainPage: NextPage<AdminPanelPageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Panel - Rollify</title>
			</Head>
			<AdminMain {...props} />
		</>
	);
};

const AdminMain: React.FC<AdminPanelPageProps> = (props) => {
	const { t } = useI18n<Locale>();
	const socket = useSocket('admin');

	return (
		<Container sx={{ my: 2 }}>
			<Box textAlign='center'>
				<Typography variant='h3' component='h1'>
					{t('admin.panelTitle')}
				</Typography>
			</Box>

			<Box textAlign='center'>
				<EnvironmentField environment={props.environment || 'idle'} />
			</Box>

			<SocketContext.Provider value={socket}>
				<CharacterContainer
					players={props.players.map((player) => ({
						id: player.id,
						name: player.name || t('unknown'),
						attribute: player.PlayerAttributes.map((attr) => ({
							...attr,
							...attr.Attribute,
						})),
						attributeStatus: player.PlayerAttributeStatus.map((attr) => ({
							...attr,
							...attr.AttributeStatus,
						})),
					}))}
					npcs={props.npcs.map((npc) => ({
						id: npc.id,
						name: npc.name || t('unknown'),
						attribute: npc.PlayerAttributes.map((attr) => ({
							...attr,
							...attr.Attribute,
						})),
						attributeStatus: npc.PlayerAttributeStatus.map((attr) => ({
							...attr,
							...attr.AttributeStatus,
						})),
					}))}
					baseDice={props.baseDice}
				/>
			</SocketContext.Provider>

			<PlayerNotesContainer
				title={t('sheet.playerNotesTitle')}
				value={props.annotations?.value || ''}
			/>
		</Container>
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
						extraValue: true,
					},
				},
			},
		}),
		prisma.player.findMany({
			where: { role: 'NPC' },
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
						extraValue: true,
					},
				},
			},
		}),
		prisma.config.findUnique({ where: { name: 'environment' } }),
		prisma.config.findUnique({ where: { name: 'dice' } }),
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
			environment: (results[2]?.value as Environment | undefined) || null,
			baseDice: (JSON.parse(results[3]?.value as string) as DiceConfig).baseDice,
			annotations: results[4],
			table,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default AdminMainPage;
