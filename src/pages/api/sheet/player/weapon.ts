import type { Weapon, PlayerWeapon } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerWeaponApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{
		weapon: PlayerWeapon & {
			Weapon: Weapon;
		};
	}
>;

export type PlayerGetWeaponApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_player_id',
	{ weapons: Weapon[] }
>;

const handler: NextApiHandlerIO = async (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	return res.status(405).end();
};

const handleGet: NextApiHandlerIO<PlayerGetWeaponApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const playerId = parseInt(req.query.playerId as string);

	if (!playerId) return res.json({ status: 'failure', reason: 'invalid_player_id' });

	const weapons = (
		await prisma.playerWeapon.findMany({
			where: { player_id: playerId },
			select: { Weapon: true },
		})
	).map((e) => e.Weapon);

	res.json({ status: 'success', weapons: weapons });
};

const handlePost: NextApiHandlerIO<PlayerWeaponApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const weapon_id = Number(req.body.id);
	const player_id = npcId || player.id;
	const currentAmmo = req.body.currentAmmo === undefined ? undefined : Number(req.body.currentAmmo);

	try {
		const weapon = await prisma.playerWeapon.update({
			data: { currentAmmo },
			where: { player_id_weapon_id: { player_id, weapon_id } },
			include: { Weapon: true },
		});

		res.json({ status: 'success', weapon });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<PlayerWeaponApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const weapon_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const weapon = await prisma.playerWeapon.create({
			data: {
				currentAmmo: 0,
				player_id,
				weapon_id,
			},
			include: { Weapon: true },
		});

		res.json({ status: 'success', weapon });

		res.socket.server.io.to('admin').emit('playerWeaponAdd', player_id, weapon.Weapon);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<PlayerWeaponApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const weapon_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const weapon = await prisma.playerWeapon.delete({
			where: { player_id_weapon_id: { player_id, weapon_id } },
			include: { Weapon: true },
		});

		res.json({ status: 'success', weapon });

		res.socket.server.io.to('admin').emit('playerWeaponRemove', player_id, weapon_id);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
