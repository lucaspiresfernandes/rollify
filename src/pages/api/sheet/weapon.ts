import type { Weapon } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type WeaponSheetApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ weapon: Weapon[] }
>;

const handler: NextApiHandlerIO = (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handleGet: NextApiHandlerIO<WeaponSheetApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = npcId || player.id;

	const weapon = await prisma.weapon.findMany({
		where: { visible: true, PlayerWeapon: { none: { player_id } } },
	});

	res.json({ status: 'success', weapon });
};

const handlePost: NextApiHandlerIO<WeaponSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.id ||
		!req.body.name ||
		req.body.weight === undefined ||
		req.body.type === undefined ||
		req.body.damage === undefined ||
		req.body.range === undefined ||
		req.body.attacks === undefined ||
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
	const weight = Number(req.body.weight);
	const damage = String(req.body.damage);
	const range = String(req.body.range);
	const attacks = String(req.body.attacks);
	const ammo = req.body.ammo === null ? null : Number(req.body.ammo);
	const visible = Boolean(req.body.visible);

	try {
		const weapon = await prisma.weapon.update({
			where: { id },
			data: { name, type, weight, damage, range, attacks, ammo, visible },
		});

		res.json({ status: 'success', weapon: [weapon] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<WeaponSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.name ||
		!req.body.type ||
		!req.body.damage ||
		!req.body.range ||
		!req.body.attacks ||
		req.body.weight === undefined ||
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
	const weight = Number(req.body.weight);
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
		const weapon = await prisma.weapon.create({
			data: {
				name,
				weight,
				ammo,
				attacks,
				damage,
				range,
				type,
				visible,
				PlayerWeapon: {
					createMany: {
						data: players.map(({ id: player_id }) => ({ player_id })),
					},
				},
			},
		});

		res.json({ status: 'success', weapon: [weapon] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<WeaponSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const weapon = await prisma.weapon.delete({ where: { id } });

		res.json({ status: 'success', weapon: [weapon] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
