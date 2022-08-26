import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerListApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ players: { id: number; name: string }[] }
>;

const handler: NextApiHandlerIO<PlayerListApiResponse> = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = npcId || player.id;

	const id = req.query.id ? parseInt(req.query.id as string) : undefined;

	const players = (
		await prisma.player.findMany({
			where: {
				role: { in: player.admin ? ['PLAYER'] : ['PLAYER', 'NPC'] },
				id: { not: player_id, equals: id },
			},
			select: { id: true, name: true, role: true, showName: true },
		})
	).filter((player) => player.showName || player.role === 'PLAYER');

	res.json({ status: 'success', players });
};

export default withSessionApi(handler);
