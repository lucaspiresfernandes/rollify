import type { AsyncReturnType } from '../../../../utils';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

const getPlayerData = async (id: number) => {
	const data = await prisma.player.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			maxLoad: true,
			spellSlots: true,
			PlayerInfo: { select: { Info: { select: { id: true, name: true } }, value: true } },
			PlayerSpec: { select: { Spec: { select: { id: true, name: true } }, value: true } },
			PlayerAttributes: {
				select: {
					Attribute: { select: { id: true, name: true, color: true } },
					value: true,
					maxValue: true,
					extraValue: true,
				},
			},
			PlayerAttributeStatus: {
				select: {
					AttributeStatus: { select: { id: true, name: true, attribute_id: true } },
					value: true,
				},
			},
			PlayerCharacteristic: {
				select: {
					Characteristic: { select: { id: true, name: true } },
					value: true,
					modifier: true,
				},
			},
			PlayerSkill: {
				select: {
					Skill: { select: { id: true, name: true } },
					value: true,
					modifier: true,
				},
				where: { favourite: true },
			},
			PlayerWeapon: { select: { Weapon: true, currentAmmo: true } },
			PlayerArmor: { select: { Armor: true } },
			PlayerItem: { select: { Item: true, currentDescription: true, quantity: true } },
			PlayerCurrency: { select: { Currency: { select: { id: true, name: true } }, value: true } },
			PlayerSpell: { select: { Spell: true } },
		},
	});
	return data;
};

export type PlayerApiResponsePlayerData = AsyncReturnType<typeof getPlayerData>;

export type PlayerApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ player: PlayerApiResponsePlayerData }
>;

const handler: NextApiHandlerIO<PlayerApiResponse> = (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	res.status(405).end();
};

const handleGet: NextApiHandlerIO<PlayerApiResponse> = async (req, res) => {
	if (!req.session.player) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.query.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	try {
		const id = Number(req.query.id);
		res.json({ status: 'success', player: await getPlayerData(id) });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePost: NextApiHandlerIO<PlayerApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	const name: string | undefined = req.body.name;
	const showName: boolean | undefined = req.body.showName;
	const maxLoad: number | undefined = req.body.maxLoad;
	const maxSlots: number | undefined = req.body.maxSlots;

	const playerId = npcId || player.id;

	try {
		await prisma.player.update({
			where: { id: playerId },
			data: { name, showName, maxLoad, spellSlots: maxSlots },
		});

		res.json({ status: 'success', player: null });

		const listeners = res.socket.server.io.to(`portrait${playerId}`).to('admin');

		if (!npcId) {
			if (maxSlots !== undefined) listeners.emit('playerSpellSlotsChange', playerId, maxSlots);
			if (maxLoad !== undefined) {
				console.log('maxLoad:', maxLoad);
				listeners.emit('playerMaxLoadChange', playerId, maxLoad);
			}
		}

		if (name !== undefined) listeners.emit('playerNameChange', playerId, name);
		if (showName !== undefined) listeners.emit('playerNameShowChange', playerId, showName);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<PlayerApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	const playerId = req.body.id;

	if (!playerId) return res.json({ status: 'failure', reason: 'invalid_body' });

	try {
		await prisma.player.delete({ where: { id: playerId } });

		res.json({ status: 'success', player: null });

		res.socket.server.io.to(`player${playerId}`).emit('playerDelete');
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
