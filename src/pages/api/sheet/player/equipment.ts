import type { Equipment, PlayerEquipment } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerEquipmentApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{
		equipment: PlayerEquipment & {
			Equipment: Equipment;
		};
	}
>;

export type PlayerGetEquipmentApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_player_id',
	{ equipments: Equipment[] }
>;

const handler: NextApiHandlerIO = async (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	return res.status(405).end();
};

const handleGet: NextApiHandlerIO<PlayerGetEquipmentApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const playerId = parseInt(req.query.playerId as string);

	if (!playerId) return res.json({ status: 'failure', reason: 'invalid_player_id' });

	const equipments = (
		await prisma.playerEquipment.findMany({
			where: { player_id: playerId },
			select: { Equipment: true },
		})
	).map((e) => e.Equipment);

	res.json({ status: 'success', equipments });
};

const handlePost: NextApiHandlerIO<PlayerEquipmentApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const equipment_id = Number(req.body.id);
	const player_id = npcId || player.id;
	const currentAmmo = req.body.currentAmmo === undefined ? undefined : Number(req.body.currentAmmo);

	try {
		const equipment = await prisma.playerEquipment.update({
			data: { currentAmmo },
			where: { player_id_equipment_id: { player_id, equipment_id } },
			include: { Equipment: true },
		});

		res.json({ status: 'success', equipment });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<PlayerEquipmentApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const equipment_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const equipment = await prisma.playerEquipment.create({
			data: {
				currentAmmo: 0,
				player_id,
				equipment_id,
			},
			include: { Equipment: true },
		});

		res.json({ status: 'success', equipment });

		res.socket.server.io.to('admin').emit('playerEquipmentAdd', player_id, equipment.Equipment);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<PlayerEquipmentApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const equipment_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const equipment = await prisma.playerEquipment.delete({
			where: { player_id_equipment_id: { player_id, equipment_id } },
			include: { Equipment: true },
		});

		res.json({ status: 'success', equipment });

		res.socket.server.io.to('admin').emit('playerEquipmentRemove', player_id, equipment_id);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
