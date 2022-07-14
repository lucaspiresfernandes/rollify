import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type PlayerAttributeStatusApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

const handler: NextApiHandlerIO<PlayerAttributeStatusApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.value || !req.body.id)
		return res.json({ status: 'failure', reason: 'invalid_body' });

	const attribute_status_id = Number(req.body.id);
	const value = Boolean(req.body.value);

	const player_id = npcId || player.id;

	try {
		await prisma.playerAttributeStatus.update({
			data: { value },
			where: {
				player_id_attribute_status_id: { attribute_status_id, player_id },
			},
		});

		res.json({ status: 'success' });

		res.socket.server.io
			.to('admin')
			.to(`portrait${player_id}`)
			.emit('playerAttributeStatusChange', player_id, attribute_status_id, value);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
