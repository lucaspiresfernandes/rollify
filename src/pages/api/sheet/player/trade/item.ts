import type { Item, PlayerItem, Trade } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type TradeItemApiResponse = NextApiResponseData<
	| 'unauthorized'
	| 'invalid_body'
	| 'trade_already_exists'
	| 'trading_same_item'
	| 'sender_does_not_have_item'
	| 'receiver_item_already_exists'
	| 'receiver_does_not_have_item'
	| 'receiver_already_has_item'
	| 'trade_does_not_exist',
	{
		trade: Trade;
		item:
			| (PlayerItem & {
					Item: Item;
			  })
			| null;
	}
>;

const handler: NextApiHandlerIO<TradeItemApiResponse> = (req, res) => {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePut: NextApiHandlerIO<TradeItemApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) {
		res.status(401).end();
		return;
	}

	const senderId = player.id;
	const senderItemId: number | undefined = req.body.offerId;

	const receiverId: number | undefined = req.body.playerId;
	const receiverItemId: number | undefined = req.body.tradeId;

	if (!senderItemId || !receiverId) return res.json({ status: 'failure', reason: 'invalid_body' });

	try {
		const existingTrade = await prisma.trade.findFirst({
			where: {
				OR: [{ sender_id: receiverId }, { receiver_id: receiverId }],
			},
		});

		if (existingTrade)
			return res.json({
				status: 'failure',
				reason: 'trade_already_exists',
			});

		if (receiverItemId) {
			if (senderItemId === receiverItemId)
				return res.json({ status: 'failure', reason: 'trading_same_item' });

			const senderTradeItem = await prisma.playerItem.findUnique({
				where: {
					player_id_item_id: {
						player_id: senderId,
						item_id: receiverItemId,
					},
				},
			});

			if (senderTradeItem)
				return res.json({
					status: 'failure',
					reason: 'receiver_item_already_exists',
				});

			const receiverItem = await prisma.playerItem.findUnique({
				where: {
					player_id_item_id: {
						player_id: receiverId,
						item_id: receiverItemId,
					},
				},
			});

			if (receiverItem === null)
				return res.json({
					status: 'failure',
					reason: 'receiver_does_not_have_item',
				});
		} else {
			const receiverItem = await prisma.playerItem.findUnique({
				where: {
					player_id_item_id: {
						player_id: receiverId,
						item_id: senderItemId,
					},
				},
			});

			if (receiverItem !== null)
				return res.json({
					status: 'failure',
					reason: 'receiver_already_has_item',
				});
		}

		const senderItem = await prisma.playerItem.findUnique({
			where: {
				player_id_item_id: {
					player_id: senderId,
					item_id: senderItemId,
				},
			},
			select: {
				Player: { select: { name: true } },
				Item: { select: { name: true } },
			},
		});

		if (!senderItem)
			return res.json({
				status: 'failure',
				reason: 'sender_does_not_have_item',
			});

		const trade = await prisma.trade.create({
			data: {
				sender_id: senderId,
				sender_object_id: senderItemId,
				receiver_id: receiverId,
				receiver_object_id: receiverItemId,
			},
		});

		res.json({ status: 'success', trade, item: null });

		res.socket.server.io
			.to(`player${receiverId}`)
			.emit(
				'playerTradeRequest',
				'item',
				trade.id,
				trade.receiver_object_id,
				senderItem.Player.name,
				senderItem.Item.name
			);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePost: NextApiHandlerIO<TradeItemApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const tradeId: number | undefined = req.body.tradeId;
	const accept: boolean | undefined = req.body.accept;

	if (accept === undefined || !tradeId)
		return res.json({ status: 'failure', reason: 'invalid_body' });

	try {
		const trade = await prisma.trade.findUnique({ where: { id: tradeId } });

		if (trade === null || trade.receiver_id !== player.id)
			return res.json({ status: 'failure', reason: 'trade_does_not_exist' });

		await prisma.trade.delete({ where: { id: tradeId } });

		if (!accept) {
			res.socket.server.io.to(`player${trade.sender_id}`).emit('playerTradeResponse', false);
			return res.json({ status: 'success', trade, item: null });
		}

		if (trade.receiver_object_id) {
			const results = await prisma.$transaction([
				prisma.playerItem.update({
					where: {
						player_id_item_id: {
							player_id: trade.sender_id,
							item_id: trade.sender_object_id,
						},
					},
					data: { player_id: trade.receiver_id },
					include: { Item: true },
				}),
				prisma.playerItem.update({
					where: {
						player_id_item_id: {
							player_id: trade.receiver_id,
							item_id: trade.receiver_object_id,
						},
					},
					data: { player_id: trade.sender_id },
					include: { Item: true },
				}),
			]);

			const newSenderItem = results[0];
			const newReceiverItem = results[1];

			res.json({ status: 'success', trade, item: newSenderItem });

			res.socket.server.io.to(`player${trade.sender_id}`).emit('playerTradeResponse', accept, {
				type: 'item',
				obj: results[1],
			});

			res.socket.server.io
				.to('admin')
				.emit('playerItemRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerItemRemove', trade.receiver_id, trade.receiver_object_id);
			res.socket.server.io
				.to('admin')
				.emit(
					'playerItemAdd',
					trade.sender_id,
					newSenderItem.Item,
					newSenderItem.currentDescription,
					newSenderItem.quantity
				);
			res.socket.server.io
				.to('admin')
				.emit(
					'playerItemAdd',
					trade.receiver_id,
					newReceiverItem.Item,
					newReceiverItem.currentDescription,
					newReceiverItem.quantity
				);
		} else {
			const item = await prisma.playerItem.update({
				where: {
					player_id_item_id: {
						player_id: trade.sender_id,
						item_id: trade.sender_object_id,
					},
				},
				data: { player_id: trade.receiver_id },
				include: { Item: true },
			});

			res.json({ status: 'success', trade, item });

			res.socket.server.io.to(`player${trade.sender_id}`).emit('playerTradeResponse', accept);

			res.socket.server.io
				.to('admin')
				.emit('playerItemRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io
				.to('admin')
				.emit(
					'playerItemAdd',
					trade.receiver_id,
					item.Item,
					item.currentDescription,
					item.quantity
				);
		}
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<TradeItemApiResponse> = async (req, res) => {
	if (!req.session.player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const tradeId: number | undefined = req.body.tradeId;

	if (!tradeId) return res.json({ status: 'failure', reason: 'invalid_body' });

	try {
		const existingTrade = await prisma.trade.findUnique({
			where: { id: tradeId },
			select: { id: true, receiver_id: true },
		});

		if (!existingTrade)
			return res.json({
				status: 'failure',
				reason: 'trade_does_not_exist',
			});

		await prisma.trade.delete({ where: { id: existingTrade.id } });

		res.end();
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
