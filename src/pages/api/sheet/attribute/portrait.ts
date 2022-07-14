import type { PortraitAttribute } from '@prisma/client';
import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type AttributePortraitApiResponse = NextApiResponseData<'invalid_body' | 'unauthorized'>;

type RequestBody = { id: number; portrait: PortraitAttribute | null };

const handler: NextApiHandler<AttributePortraitApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.primary || !req.body.secondary)
		return res.json({ status: 'failure', reason: 'invalid_body' });

	const primary: RequestBody[] = req.body.primary;
	const secondary: RequestBody | null = req.body.secondary;

	const primaryIds = primary.map((p) => p.id);

	try {
		await prisma.attribute.updateMany({ data: { portrait: null } });
		await Promise.all([
			prisma.attribute.updateMany({
				where: { id: { in: primaryIds } },
				data: { portrait: 'PRIMARY' },
			}),
			secondary !== null
				? prisma.attribute.update({
						where: { id: secondary.id },
						data: { portrait: 'SECONDARY' },
				  })
				: undefined,
		]);

		res.json({ status: 'success' });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
