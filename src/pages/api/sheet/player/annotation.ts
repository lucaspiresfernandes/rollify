import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerAnnotationApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

const handler: NextApiHandler<PlayerAnnotationApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (req.body.value === undefined) return res.json({ status: 'failure', reason: 'invalid_body' });

	const value = String(req.body.value);

	try {
		await prisma.playerNote.update({
			data: { value },
			where: { player_id: npcId || player.id },
		});

		res.json({ status: 'success' });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
