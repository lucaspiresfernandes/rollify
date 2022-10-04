import type { PlayerSpell, Spell } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerSpellApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ spell: PlayerSpell & { Spell: Spell } }
>;

const handler: NextApiHandlerIO = async (req, res) => {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	return res.status(405).end();
};

const handlePut: NextApiHandlerIO<PlayerSpellApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

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
				currentDescription: '',
			},
			include: { Spell: true },
		});

		await prisma.playerSpell.update({
			where: { player_id_spell_id: { player_id, spell_id } },
			data: { currentDescription: spell.Spell.description },
		});

		spell.currentDescription = spell.Spell.description;

		res.json({ status: 'success', spell });

		res.socket.server.io.to('admin').emit('playerSpellAdd', player_id, spell);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePost: NextApiHandlerIO<PlayerSpellApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) return res.json({ status: 'failure', reason: 'invalid_body' });

	const spell_id = Number(req.body.id);
	const player_id = npcId || player.id;
	const currentDescription =
		req.body.currentDescription === undefined ? undefined : String(req.body.currentDescription);

	try {
		const spell = await prisma.playerSpell.update({
			data: { currentDescription },
			where: { player_id_spell_id: { player_id, spell_id } },
			include: { Spell: true },
		});

		res.json({ status: 'success', spell });

		if (currentDescription)
			res.socket.server.io.emit('playerSpellChange', player_id, spell_id, currentDescription);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<PlayerSpellApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.query.npcId) || undefined;

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

		res.json({ status: 'success', spell });

		res.socket.server.io.to('admin').emit('playerSpellRemove', player_id, spell_id);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
