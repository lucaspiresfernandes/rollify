import type { Equipment, PlayerEquipment, Trade } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type TradeEquipmentApiResponse = NextApiResponseData<
	| 'unauthorized'
	| 'invalid_body'
	| 'trade_already_exists'
	| 'trading_same_item'
	| 'sender_does_not_have_equipment'
	| 'receiver_equipment_already_exists'
	| 'receiver_does_not_have_equipment'
	| 'receiver_already_has_equipment'
	| 'trade_does_not_exist',
	{
		trade: Trade;
		equipment:
			| (PlayerEquipment & {
					Equipment: Equipment;
			  })
			| null;
	}
>;

const handler: NextApiHandlerIO<TradeEquipmentApiResponse> = (req, res) => {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePut: NextApiHandlerIO<TradeEquipmentApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const senderId = player.id;
	const senderEquipmentId: number | undefined = req.body.offerId;

	const receiverId: number | undefined = req.body.playerId;
	const receiverEquipmentId: number | undefined = req.body.tradeId;

	if (!senderEquipmentId || !receiverId)
		return res.json({ status: 'failure', reason: 'invalid_body' });

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

		if (receiverEquipmentId) {
			if (senderEquipmentId === receiverEquipmentId)
				return res.json({ status: 'failure', reason: 'trading_same_item' });

			const senderTradeEquip = await prisma.playerEquipment.findUnique({
				where: {
					player_id_equipment_id: {
						player_id: senderId,
						equipment_id: receiverEquipmentId,
					},
				},
			});

			if (senderTradeEquip)
				return res.json({
					status: 'failure',
					reason: 'receiver_equipment_already_exists',
				});

			const receiverEquip = await prisma.playerEquipment.findUnique({
				where: {
					player_id_equipment_id: {
						player_id: receiverId,
						equipment_id: receiverEquipmentId,
					},
				},
			});

			if (receiverEquip === null)
				return res.json({
					status: 'failure',
					reason: 'receiver_does_not_have_equipment',
				});
		} else {
			const receiverEquip = await prisma.playerEquipment.findUnique({
				where: {
					player_id_equipment_id: {
						player_id: receiverId,
						equipment_id: senderEquipmentId,
					},
				},
			});

			if (receiverEquip !== null)
				return res.json({
					status: 'failure',
					reason: 'receiver_already_has_equipment',
				});
		}

		const senderEquip = await prisma.playerEquipment.findUnique({
			where: {
				player_id_equipment_id: {
					player_id: senderId,
					equipment_id: senderEquipmentId,
				},
			},
			select: {
				Player: { select: { name: true } },
				Equipment: { select: { name: true } },
			},
		});

		if (!senderEquip)
			return res.json({
				status: 'failure',
				reason: 'sender_does_not_have_equipment',
			});

		const trade = await prisma.trade.create({
			data: {
				sender_id: senderId,
				sender_object_id: senderEquipmentId,
				receiver_id: receiverId,
				receiver_object_id: receiverEquipmentId,
			},
		});

		res.json({ status: 'success', trade, equipment: null });

		res.socket.server.io
			.to(`player${receiverId}`)
			.emit(
				'playerTradeRequest',
				'equipment',
				trade.id,
				receiverEquipmentId || null,
				senderEquip.Player.name,
				senderEquip.Equipment.name
			);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePost: NextApiHandlerIO<TradeEquipmentApiResponse> = async (req, res) => {
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
			return res.json({ status: 'success', trade, equipment: null });
		}

		if (trade.receiver_object_id) {
			const results = await prisma.$transaction([
				prisma.playerEquipment.update({
					where: {
						player_id_equipment_id: {
							player_id: trade.sender_id,
							equipment_id: trade.sender_object_id,
						},
					},
					data: { player_id: trade.receiver_id },
					include: { Equipment: true },
				}),
				prisma.playerEquipment.update({
					where: {
						player_id_equipment_id: {
							player_id: trade.receiver_id,
							equipment_id: trade.receiver_object_id,
						},
					},
					data: { player_id: trade.sender_id },
					include: { Equipment: true },
				}),
			]);

			const newSenderEquipment = results[0];
			const newReceiverEquipment = results[1];

			res.json({ status: 'success', trade, equipment: newSenderEquipment });

			res.socket.server.io.to(`player${trade.sender_id}`).emit('playerTradeResponse', accept, {
				type: 'equipment',
				obj: results[1],
			});

			res.socket.server.io
				.to('admin')
				.emit('playerEquipmentRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerEquipmentRemove', trade.receiver_id, trade.receiver_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerEquipmentAdd', trade.sender_id, newSenderEquipment.Equipment);
			res.socket.server.io
				.to('admin')
				.emit('playerEquipmentAdd', trade.receiver_id, newReceiverEquipment.Equipment);
		} else {
			const equipment = await prisma.playerEquipment.update({
				where: {
					player_id_equipment_id: {
						player_id: trade.sender_id,
						equipment_id: trade.sender_object_id,
					},
				},
				data: { player_id: trade.receiver_id },
				include: { Equipment: true },
			});

			res.json({ status: 'success', trade, equipment });

			res.socket.server.io.to(`player${trade.sender_id}`).emit('playerTradeResponse', accept);

			res.socket.server.io
				.to('admin')
				.emit('playerEquipmentRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerEquipmentAdd', trade.receiver_id, equipment.Equipment);
		}
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<TradeEquipmentApiResponse> = async (req, res) => {
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

		res.json({ status: 'success', trade, equipment: null });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
