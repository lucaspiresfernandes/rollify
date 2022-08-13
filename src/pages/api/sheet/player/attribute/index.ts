import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type PlayerAttributeApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

const handler: NextApiHandlerIO<PlayerAttributeApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const attribute_id = Number(req.body.id);
	const value = req.body.value === undefined ? undefined : Number(req.body.value);
	const maxValue = req.body.maxValue === undefined ? undefined : Number(req.body.maxValue);
	const extraValue = req.body.extraValue === undefined ? undefined : Number(req.body.extraValue);
	const show = req.body.show === undefined ? undefined : Boolean(req.body.show);

	const player_id = npcId || player.id;

	try {
		const char = await prisma.playerAttribute.update({
			data: { value, maxValue, extraValue, show },
			where: { player_id_attribute_id: { player_id, attribute_id } },
			select: { value: true, maxValue: true, extraValue: true, show: true },
		});

		res.json({ status: 'success' });

		res.socket.server.io
			.to('admin')
			.to(`portrait${player_id}`)
			.emit(
				'playerAttributeChange',
				player_id,
				attribute_id,
				char.value,
				char.maxValue,
				char.extraValue,
				char.show
			);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
