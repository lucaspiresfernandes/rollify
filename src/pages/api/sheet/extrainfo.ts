import type { ExtraInfo } from '@prisma/client';
import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type ExtraInfoSheetApiResponse = NextApiResponseData<
	'invalid_body' | 'unauthorized',
	{ extraInfo: ExtraInfo }
>;

const handler: NextApiHandler<ExtraInfoSheetApiResponse> = (req, res) => {
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePost: NextApiHandler<ExtraInfoSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id || !req.body.name)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);
	const name = String(req.body.name);

	try {
		const extraInfo = await prisma.extraInfo.update({
			data: { name },
			where: { id },
		});

		res.json({ status: 'success', extraInfo });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandler<ExtraInfoSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.name)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const name = String(req.body.name);

	try {
		const players = await prisma.player.findMany({
			where: { role: { in: ['PLAYER', 'NPC'] } },
			select: { id: true },
		});

		const extraInfo = await prisma.extraInfo.create({
			data: {
				name,
				PlayerExtraInfo: {
					createMany: {
						data: players.map(({ id: player_id }) => ({ player_id, value: '' })),
					},
				},
			},
		});

		res.json({ status: 'success', extraInfo });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandler<ExtraInfoSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const extraInfo = await prisma.extraInfo.delete({ where: { id } });

		res.json({ status: 'success', extraInfo });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
