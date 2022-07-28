import type { Armor } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type ArmorSheetApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ armor: Armor[] }
>;

const handler: NextApiHandlerIO = (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handleGet: NextApiHandlerIO<ArmorSheetApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = npcId || player.id;

	const armor = await prisma.armor.findMany({
		where: { visible: true, PlayerArmor: { none: { player_id } } },
	});

	res.json({ status: 'success', armor });
};

const handlePost: NextApiHandlerIO<ArmorSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.id ||
		!req.body.name ||
		!req.body.type ||
		!req.body.damageReduction ||
		!req.body.penalty ||
		req.body.weight === undefined ||
		req.body.visible === undefined
	) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const id = Number(req.body.id);
	const name = String(req.body.name);
	const type = String(req.body.type);
	const weight = Number(req.body.weight);
	const damageReduction = String(req.body.damageReduction);
	const penalty = String(req.body.penalty);
	const visible = Boolean(req.body.visible);

	try {
		const armor = await prisma.armor.update({
			where: { id },
			data: { name, weight, damageReduction, penalty, type, visible },
		});

		res.json({ status: 'success', armor: [armor] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<ArmorSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.name ||
		!req.body.type ||
		!req.body.damageReduction ||
		!req.body.penalty ||
		req.body.weight === undefined ||
		req.body.visible === undefined
	) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const name = String(req.body.name);
	const type = String(req.body.type);
	const weight = Number(req.body.weight);
	const damageReduction = String(req.body.damageReduction);
	const penalty = String(req.body.penalty);
	const visible = Boolean(req.body.visible);

	const players = await prisma.player.findMany({
		where: { role: { in: ['PLAYER', 'NPC'] } },
		select: { id: true },
	});

	try {
		const armor = await prisma.armor.create({
			data: {
				name,
				weight,
				damageReduction,
				penalty,
				type,
				visible,
				PlayerArmor: {
					createMany: {
						data: players.map(({ id: player_id }) => ({ player_id })),
					},
				},
			},
		});

		res.json({ status: 'success', armor: [armor] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<ArmorSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const armor = await prisma.armor.delete({ where: { id } });

		res.json({ status: 'success', armor: [armor] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
