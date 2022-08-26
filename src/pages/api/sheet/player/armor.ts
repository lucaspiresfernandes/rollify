import type { Armor, PlayerArmor } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerArmorApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ armor: PlayerArmor & { Armor: Armor } }
>;

export type PlayerGetArmorApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_player_id',
	{ armor: Armor[] }
>;

const handler: NextApiHandlerIO = async (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	return res.status(405).end();
};

const handleGet: NextApiHandlerIO<PlayerGetArmorApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = parseInt(req.query.playerId as string) || player.id;

	if (!player_id) return res.json({ status: 'failure', reason: 'invalid_player_id' });

	const armor = (
		await prisma.playerArmor.findMany({
			where: { player_id: player_id, Armor: { visible: true } },
			select: { Armor: true },
		})
	).map((e) => e.Armor);

	res.json({ status: 'success', armor });
};

const handlePut: NextApiHandlerIO<PlayerArmorApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const armor_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const armor = await prisma.playerArmor.create({
			data: {
				player_id,
				armor_id,
				currentDescription: '',
			},
			include: { Armor: true },
		});

		await prisma.playerArmor.update({
			where: { player_id_armor_id: { player_id, armor_id } },
			data: { currentDescription: armor.Armor.description },
		});

		armor.currentDescription = armor.Armor.description;

		res.json({ status: 'success', armor });

		res.socket.server.io.to('admin').emit('playerArmorAdd', player_id, armor);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePost: NextApiHandlerIO<PlayerArmorApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const armor_id = Number(req.body.id);
	const player_id = npcId || player.id;
	const currentDescription =
		req.body.currentDescription === undefined ? undefined : String(req.body.currentDescription);

	try {
		const armor = await prisma.playerArmor.update({
			data: { currentDescription },
			where: { player_id_armor_id: { player_id, armor_id } },
			include: { Armor: true },
		});

		res.json({ status: 'success', armor });
		
		if (currentDescription)
			res.socket.server.io.emit('playerArmorChange', player_id, armor_id, currentDescription);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<PlayerArmorApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const armor_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const armor = await prisma.playerArmor.delete({
			where: { player_id_armor_id: { player_id, armor_id } },
			include: { Armor: true },
		});

		res.json({ status: 'success', armor });

		res.socket.server.io.to('admin').emit('playerArmorRemove', player_id, armor_id);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
