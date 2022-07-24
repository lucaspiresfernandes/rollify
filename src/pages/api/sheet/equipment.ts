import type { Equipment } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type EquipmentSheetApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ equipment: Equipment[] }
>;

const handler: NextApiHandlerIO = (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handleGet: NextApiHandlerIO<EquipmentSheetApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = npcId || player.id;

	const equipment = await prisma.equipment.findMany({
		where: { visible: true, PlayerEquipment: { none: { player_id } } },
	});

	res.json({ status: 'success', equipment });
};

const handlePost: NextApiHandlerIO<EquipmentSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.id ||
		!req.body.name ||
		!req.body.type ||
		!req.body.damage ||
		!req.body.range ||
		!req.body.attacks ||
		req.body.ammo === undefined ||
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
	const damage = String(req.body.damage);
	const range = String(req.body.range);
	const attacks = String(req.body.attacks);
	const ammo = req.body.ammo === null ? null : Number(req.body.ammo);
	const visible = Boolean(req.body.visible);

	try {
		const equipment = await prisma.equipment.update({
			where: { id },
			data: { name, type, damage, range, attacks, ammo, visible },
		});

		res.json({ status: 'success', equipment: [equipment] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<EquipmentSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.name ||
		!req.body.type ||
		!req.body.damage ||
		!req.body.range ||
		!req.body.attacks ||
		req.body.ammo === undefined ||
		req.body.visible === undefined
	) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const name = String(req.body.name);
	const type = String(req.body.type);
	const damage = String(req.body.damage);
	const range = String(req.body.range);
	const attacks = String(req.body.attacks);
	const ammo = req.body.ammo === null ? null : Number(req.body.ammo);
	const visible = Boolean(req.body.visible);

	const players = await prisma.player.findMany({
		where: { role: { in: ['PLAYER', 'NPC'] } },
		select: { id: true },
	});

	try {
		const equipment = await prisma.equipment.create({
			data: {
				name,
				ammo,
				attacks,
				damage,
				range,
				type,
				visible,
				PlayerEquipment: {
					createMany: {
						data: players.map(({ id: player_id }) => ({ player_id })),
					},
				},
			},
		});

		res.json({ status: 'success', equipment: [equipment] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<EquipmentSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const equipment = await prisma.equipment.delete({ where: { id } });

		res.json({ status: 'success', equipment: [equipment] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
