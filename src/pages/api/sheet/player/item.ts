import type { Item, PlayerItem } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerItemApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{
		item: PlayerItem & {
			Item: Item;
		};
	}
>;

export type PlayerGetItemApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_player_id',
	{ item: Item[] }
>;

const handler: NextApiHandlerIO = async (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	return res.status(405).end();
};

const handleGet: NextApiHandlerIO<PlayerGetItemApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = parseInt(req.query.playerId as string) || player.id;
	const item_id = req.query.itemId ? parseInt(req.query.itemId as string) : undefined;

	if (!player_id) return res.json({ status: 'failure', reason: 'invalid_player_id' });

	const item = (
		await prisma.playerItem.findMany({
			where: { player_id, item_id, Item: { visible: true } },
			select: { Item: true },
		})
	).map((e) => e.Item);

	res.json({ status: 'success', item });
};

const handlePost: NextApiHandlerIO<PlayerItemApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const item_id = Number(req.body.id);
	const player_id = npcId || player.id;
	const quantity = req.body.quantity === undefined ? undefined : Number(req.body.quantity);
	const currentDescription =
		req.body.currentDescription === undefined ? undefined : String(req.body.currentDescription);

	try {
		const item = await prisma.playerItem.update({
			data: { quantity, currentDescription },
			where: { player_id_item_id: { player_id, item_id } },
			include: { Item: true },
		});

		res.json({ status: 'success', item });

		res.socket.server.io.emit(
			'playerItemChange',
			player_id,
			item_id,
			item.currentDescription,
			item.quantity
		);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<PlayerItemApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const item_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const item = await prisma.playerItem.create({
			data: {
				player_id,
				item_id,
				currentDescription: '',
			},
			include: { Item: true },
		});

		await prisma.playerItem.update({
			where: { player_id_item_id: { player_id, item_id } },
			data: { currentDescription: item.Item.description },
		});

		item.currentDescription = item.Item.description;

		res.json({ status: 'success', item });

		res.socket.server.io
			.to('admin')
			.emit('playerItemAdd', player_id, item.Item, item.currentDescription, item.quantity);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<PlayerItemApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const item_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const item = await prisma.playerItem.delete({
			where: { player_id_item_id: { player_id, item_id } },
			include: { Item: true },
		});

		res.json({ status: 'success', item });

		res.socket.server.io.to('admin').emit('playerItemRemove', player_id, item_id);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
