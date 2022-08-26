import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerInfoApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

const handler: NextApiHandlerIO<PlayerInfoApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = npcId || player.id;

	if (req.body.value === undefined || !req.body.id)
		return res.json({ status: 'failure', reason: 'invalid_body' });

	const info_id = Number(req.body.id);
	const value = String(req.body.value);

	try {
		await prisma.playerInfo.update({
			data: { value },
			where: { player_id_info_id: { info_id, player_id } },
		});

		res.json({ status: 'success' });

		res.socket.server.io.to('admin').emit('playerInfoChange', player_id, info_id, value);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
