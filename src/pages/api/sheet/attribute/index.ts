import type { Attribute } from '@prisma/client';
import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type AttributeSheetApiResponse = NextApiResponseData<
	'invalid_body' | 'unauthorized',
	{ attribute: Attribute }
>;

const handler: NextApiHandler<AttributeSheetApiResponse> = (req, res) => {
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePost: NextApiHandler<AttributeSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.id ||
		!req.body.name ||
		!req.body.color ||
		req.body.rollable === undefined ||
		req.body.visibleToAdmin === undefined
	)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);
	const name = String(req.body.name);
	const color = String(req.body.color);
	const rollable = Boolean(req.body.rollable);
	const visibleToAdmin = Boolean(req.body.visibleToAdmin);

	try {
		const attribute = await prisma.attribute.update({
			where: { id },
			data: { name, color, rollable, visibleToAdmin },
		});

		res.json({ status: 'success', attribute });
	} catch (err) {
		console.log(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandler<AttributeSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.name ||
		!req.body.color ||
		req.body.rollable === undefined ||
		req.body.visibleToAdmin === undefined
	)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const name = String(req.body.name);
	const color = String(req.body.color);
	const rollable = Boolean(req.body.rollable);
	const visibleToAdmin = Boolean(req.body.visibleToAdmin);

	try {
		const players = await prisma.player.findMany({
			where: { role: { in: ['PLAYER', 'NPC'] } },
			select: { id: true },
		});

		const attribute = await prisma.attribute.create({
			data: {
				name,
				color,
				rollable,
				visibleToAdmin,
				PlayerAttribute: {
					createMany: {
						data: players.map(({ id: player_id }) => ({ player_id })),
					},
				},
			},
		});

		res.json({ status: 'success', attribute });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandler<AttributeSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const attribute = await prisma.attribute.delete({ where: { id } });
		res.json({ status: 'success', attribute });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
