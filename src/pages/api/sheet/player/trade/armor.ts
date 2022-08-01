import type { Armor, Trade } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type TradeArmorApiResponse = NextApiResponseData<
	| 'unauthorized'
	| 'invalid_body'
	| 'trade_already_exists'
	| 'trading_same_item'
	| 'sender_does_not_have_armor'
	| 'receiver_armor_already_exists'
	| 'receiver_does_not_have_armor'
	| 'receiver_already_has_armor'
	| 'trade_does_not_exist',
	{
		trade: Trade;
		armor: Armor | null;
	}
>;

const handler: NextApiHandlerIO<TradeArmorApiResponse> = (req, res) => {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePut: NextApiHandlerIO<TradeArmorApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const senderId = player.id;
	const senderArmorId: number | undefined = req.body.offerId;

	const receiverId: number | undefined = req.body.to;
	const receiverArmorId: number | undefined = req.body.for;

	if (!senderArmorId || !receiverId) return res.json({ status: 'failure', reason: 'invalid_body' });

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

		if (receiverArmorId) {
			if (senderArmorId === receiverArmorId)
				return res.json({ status: 'failure', reason: 'trading_same_item' });

			const senderTradeArmor = await prisma.playerArmor.findUnique({
				where: {
					player_id_armor_id: {
						player_id: senderId,
						armor_id: receiverArmorId,
					},
				},
			});

			if (senderTradeArmor)
				return res.json({
					status: 'failure',
					reason: 'receiver_armor_already_exists',
				});

			const receiverArmor = await prisma.playerArmor.findUnique({
				where: {
					player_id_armor_id: {
						player_id: receiverId,
						armor_id: receiverArmorId,
					},
				},
			});

			if (receiverArmor === null)
				return res.json({
					status: 'failure',
					reason: 'receiver_does_not_have_armor',
				});
		} else {
			const receiverArmor = await prisma.playerArmor.findUnique({
				where: {
					player_id_armor_id: {
						player_id: receiverId,
						armor_id: senderArmorId,
					},
				},
			});

			if (receiverArmor !== null)
				return res.json({
					status: 'failure',
					reason: 'receiver_already_has_armor',
				});
		}

		const senderArmor = await prisma.playerArmor.findUnique({
			where: {
				player_id_armor_id: {
					player_id: senderId,
					armor_id: senderArmorId,
				},
			},
			select: {
				Player: { select: { name: true } },
				Armor: { select: { name: true } },
			},
		});

		if (!senderArmor)
			return res.json({
				status: 'failure',
				reason: 'sender_does_not_have_armor',
			});

		const trade = await prisma.trade.create({
			data: {
				sender_id: senderId,
				sender_object_id: senderArmorId,
				receiver_id: receiverId,
				receiver_object_id: receiverArmorId,
			},
		});

		res.json({ status: 'success', trade, armor: null });

		res.socket.server.io.to(`player${receiverId}`).emit(
			'playerTradeRequest',
			'armor',
			trade
			// trade.id,
			// receiverArmorId || null,
			// senderArmor.Player.name,
			// senderArmor.Armor.name
		);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePost: NextApiHandlerIO<TradeArmorApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const tradeId: number | undefined = req.body.tradeId;

	if (req.body.accept === undefined || !tradeId)
		return res.json({ status: 'failure', reason: 'invalid_body' });

	try {
		const trade = await prisma.trade.findUnique({ where: { id: tradeId } });

		if (trade === null || trade.receiver_id !== player.id)
			return res.json({ status: 'failure', reason: 'trade_does_not_exist' });

		await prisma.trade.delete({ where: { id: tradeId } });

		if (!req.body.accept) {
			res.socket.server.io
				.to(`player${trade.sender_id}`)
				.emit('playerTradeResponse', 'armor', trade, false);
			return res.json({ status: 'success', trade, armor: null });
		}

		if (trade.receiver_object_id) {
			const results = await prisma.$transaction([
				prisma.playerArmor.update({
					where: {
						player_id_armor_id: {
							player_id: trade.sender_id,
							armor_id: trade.sender_object_id,
						},
					},
					data: { player_id: trade.receiver_id },
					include: { Armor: true },
				}),
				prisma.playerArmor.update({
					where: {
						player_id_armor_id: {
							player_id: trade.receiver_id,
							armor_id: trade.receiver_object_id,
						},
					},
					data: { player_id: trade.sender_id },
					include: { Armor: true },
				}),
			]);

			const newSenderArmor = results[0];
			const newReceiverArmor = results[1];

			res.json({ status: 'success', trade, armor: newSenderArmor.Armor });

			res.socket.server.io
				.to(`player${trade.sender_id}`)
				.emit('playerTradeResponse', 'armor', trade, true, results[1]);

			res.socket.server.io
				.to('admin')
				.emit('playerArmorRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerArmorRemove', trade.receiver_id, trade.receiver_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerArmorAdd', trade.sender_id, newSenderArmor.Armor);
			res.socket.server.io
				.to('admin')
				.emit('playerArmorAdd', trade.receiver_id, newReceiverArmor.Armor);
		} else {
			const armor = await prisma.playerArmor.update({
				where: {
					player_id_armor_id: {
						player_id: trade.sender_id,
						armor_id: trade.sender_object_id,
					},
				},
				data: { player_id: trade.receiver_id },
				include: { Armor: true },
			});

			res.json({ status: 'success', trade, armor: armor.Armor });

			res.socket.server.io
				.to(`player${trade.sender_id}`)
				.emit('playerTradeResponse', 'armor', trade, true);

			res.socket.server.io
				.to('admin')
				.emit('playerArmorRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io.to('admin').emit('playerArmorAdd', trade.receiver_id, armor.Armor);
		}
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<TradeArmorApiResponse> = async (req, res) => {
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

		const trade = await prisma.trade.delete({ where: { id: existingTrade.id } });

		res.json({ status: 'success', trade, armor: null });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
