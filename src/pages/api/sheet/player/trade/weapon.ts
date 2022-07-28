import type { Weapon, PlayerWeapon, Trade } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type TradeWeaponApiResponse = NextApiResponseData<
	| 'unauthorized'
	| 'invalid_body'
	| 'trade_already_exists'
	| 'trading_same_item'
	| 'sender_does_not_have_weapon'
	| 'receiver_weapon_already_exists'
	| 'receiver_does_not_have_weapon'
	| 'receiver_already_has_weapon'
	| 'trade_does_not_exist',
	{
		trade: Trade;
		weapon:
			| (PlayerWeapon & {
					Weapon: Weapon;
			  })
			| null;
	}
>;

const handler: NextApiHandlerIO<TradeWeaponApiResponse> = (req, res) => {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePut: NextApiHandlerIO<TradeWeaponApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const senderId = player.id;
	const senderWeaponId: number | undefined = req.body.offerId;

	const receiverId: number | undefined = req.body.playerId;
	const receiverWeaponId: number | undefined = req.body.tradeId;

	if (!senderWeaponId || !receiverId)
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

		if (receiverWeaponId) {
			if (senderWeaponId === receiverWeaponId)
				return res.json({ status: 'failure', reason: 'trading_same_item' });

			const senderTradeWeapon = await prisma.playerWeapon.findUnique({
				where: {
					player_id_weapon_id: {
						player_id: senderId,
						weapon_id: receiverWeaponId,
					},
				},
			});

			if (senderTradeWeapon)
				return res.json({
					status: 'failure',
					reason: 'receiver_weapon_already_exists',
				});

			const receiverWeapon = await prisma.playerWeapon.findUnique({
				where: {
					player_id_weapon_id: {
						player_id: receiverId,
						weapon_id: receiverWeaponId,
					},
				},
			});

			if (receiverWeapon === null)
				return res.json({
					status: 'failure',
					reason: 'receiver_does_not_have_weapon',
				});
		} else {
			const receiverWeapon = await prisma.playerWeapon.findUnique({
				where: {
					player_id_weapon_id: {
						player_id: receiverId,
						weapon_id: senderWeaponId,
					},
				},
			});

			if (receiverWeapon !== null)
				return res.json({
					status: 'failure',
					reason: 'receiver_already_has_weapon',
				});
		}

		const senderWeapon = await prisma.playerWeapon.findUnique({
			where: {
				player_id_weapon_id: {
					player_id: senderId,
					weapon_id: senderWeaponId,
				},
			},
			select: {
				Player: { select: { name: true } },
				Weapon: { select: { name: true } },
			},
		});

		if (!senderWeapon)
			return res.json({
				status: 'failure',
				reason: 'sender_does_not_have_weapon',
			});

		const trade = await prisma.trade.create({
			data: {
				sender_id: senderId,
				sender_object_id: senderWeaponId,
				receiver_id: receiverId,
				receiver_object_id: receiverWeaponId,
			},
		});

		res.json({ status: 'success', trade, weapon: null });

		res.socket.server.io
			.to(`player${receiverId}`)
			.emit(
				'playerTradeRequest',
				'weapon',
				trade.id,
				receiverWeaponId || null,
				senderWeapon.Player.name,
				senderWeapon.Weapon.name
			);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePost: NextApiHandlerIO<TradeWeaponApiResponse> = async (req, res) => {
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
			return res.json({ status: 'success', trade, weapon: null });
		}

		if (trade.receiver_object_id) {
			const results = await prisma.$transaction([
				prisma.playerWeapon.update({
					where: {
						player_id_weapon_id: {
							player_id: trade.sender_id,
							weapon_id: trade.sender_object_id,
						},
					},
					data: { player_id: trade.receiver_id },
					include: { Weapon: true },
				}),
				prisma.playerWeapon.update({
					where: {
						player_id_weapon_id: {
							player_id: trade.receiver_id,
							weapon_id: trade.receiver_object_id,
						},
					},
					data: { player_id: trade.sender_id },
					include: { Weapon: true },
				}),
			]);

			const newSenderWeapon = results[0];
			const newReceiverWeapon = results[1];

			res.json({ status: 'success', trade, weapon: newSenderWeapon });

			res.socket.server.io.to(`player${trade.sender_id}`).emit('playerTradeResponse', accept, {
				type: 'weapon',
				obj: results[1],
			});

			res.socket.server.io
				.to('admin')
				.emit('playerWeaponRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerWeaponRemove', trade.receiver_id, trade.receiver_object_id);
			res.socket.server.io
				.to('admin')
				.emit('playerWeaponAdd', trade.sender_id, newSenderWeapon.Weapon);
			res.socket.server.io
				.to('admin')
				.emit('playerWeaponAdd', trade.receiver_id, newReceiverWeapon.Weapon);
		} else {
			const weapon = await prisma.playerWeapon.update({
				where: {
					player_id_weapon_id: {
						player_id: trade.sender_id,
						weapon_id: trade.sender_object_id,
					},
				},
				data: { player_id: trade.receiver_id },
				include: { Weapon: true },
			});

			res.json({ status: 'success', trade, weapon });

			res.socket.server.io.to(`player${trade.sender_id}`).emit('playerTradeResponse', accept);

			res.socket.server.io
				.to('admin')
				.emit('playerWeaponRemove', trade.sender_id, trade.sender_object_id);
			res.socket.server.io.to('admin').emit('playerWeaponAdd', trade.receiver_id, weapon.Weapon);
		}
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<TradeWeaponApiResponse> = async (req, res) => {
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

		res.json({ status: 'success', trade, weapon: null });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
