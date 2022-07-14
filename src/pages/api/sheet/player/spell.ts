import type { Spell } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerSpellApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ spell: Spell }
>;

const handler: NextApiHandlerIO = async (req, res) => {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	return res.status(405).end();
};

const handlePut: NextApiHandlerIO<PlayerSpellApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const spell_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const spell = await prisma.playerSpell.create({
			data: {
				player_id,
				spell_id,
			},
			select: { Spell: true },
		});

		res.json({ status: 'success', spell: spell.Spell });

		res.socket.server.io.to('admin').emit('playerSpellAdd', player_id, spell.Spell);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<PlayerSpellApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const spell_id = Number(req.body.id);
	const player_id = npcId || player.id;

	try {
		const spell = await prisma.playerSpell.delete({
			where: { player_id_spell_id: { player_id, spell_id } },
			include: { Spell: true },
		});

		res.json({ status: 'success', spell: spell.Spell });

		res.socket.server.io.to('admin').emit('playerSpellRemove', player_id, spell_id);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
