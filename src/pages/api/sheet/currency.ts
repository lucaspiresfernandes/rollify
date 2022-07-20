import type { Currency } from '@prisma/client';
import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type CurrencySheetApiResponse = NextApiResponseData<
	'invalid_body' | 'unauthorized',
	{ currency: Currency }
>;

const handler: NextApiHandler<CurrencySheetApiResponse> = (req, res) => {
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePost: NextApiHandler<CurrencySheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id || !req.body.name || req.body.visibleToAdmin === undefined)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);
	const name = String(req.body.name);
	const visibleToAdmin = Boolean(req.body.visibleToAdmin);

	try {
		const currency = await prisma.currency.update({
			data: { name, visibleToAdmin },
			where: { id },
		});

		res.json({ status: 'success', currency });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandler<CurrencySheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.name || req.body.visibleToAdmin === undefined)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const name = String(req.body.name);
	const visibleToAdmin = Boolean(req.body.visibleToAdmin);

	try {
		const players = await prisma.player.findMany({
			where: { role: { in: ['PLAYER', 'NPC'] } },
			select: { id: true },
		});

		const currency = await prisma.currency.create({
			data: {
				name,
				visibleToAdmin,
				PlayerCurrency: {
					createMany: {
						data: players.map(({ id: player_id }) => ({ player_id })),
					},
				},
			},
		});

		res.json({ status: 'success', currency });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandler<CurrencySheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const currency = await prisma.currency.delete({ where: { id } });
		res.json({ status: 'success', currency });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
