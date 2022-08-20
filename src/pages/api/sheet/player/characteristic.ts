import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerCharacteristicApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

const handler: NextApiHandlerIO<PlayerCharacteristicApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const characteristic_id = Number(req.body.id);
	const value = req.body.value === undefined ? undefined : Number(req.body.value);
	const modifier = req.body.modifier === undefined ? undefined : Number(req.body.modifier);
	const checked = req.body.checked === undefined ? undefined : Boolean(req.body.checked);

	const player_id = npcId || player.id;

	try {
		const char = await prisma.playerCharacteristic.update({
			data: { value, modifier, checked },
			where: { player_id_characteristic_id: { player_id, characteristic_id } },
			select: { value: true, modifier: true },
		});

		res.json({ status: 'success' });

		res.socket.server.io
			.to('admin')
			.emit('playerCharacteristicChange', player_id, characteristic_id, char.value, char.modifier);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
