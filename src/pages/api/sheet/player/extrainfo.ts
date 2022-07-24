import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerExtraInfoApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

const handler: NextApiHandler<PlayerExtraInfoApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (req.body.value === undefined || !req.body.id)
		return res.json({ status: 'failure', reason: 'invalid_body' });

	const extra_info_id = Number(req.body.id);
	const value = String(req.body.value);

	try {
		await prisma.playerExtraInfo.update({
			data: { value },
			where: { player_id_extra_info_id: { extra_info_id, player_id: npcId || player.id } },
		});

		res.json({ status: 'success' });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
