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

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const players = await prisma.player.findMany({
		where: { role: { not: 'ADMIN' }, id: { not: player.id } },
		select: { id: true, name: true },
	});
	
	res.json({ status: 'success', players });
};

export default withSessionApi(handler);
