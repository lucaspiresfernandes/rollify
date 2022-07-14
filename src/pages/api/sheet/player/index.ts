import type { NextApiHandlerIO, NextApiResponseData } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionApi } from '../../../../utils/session';

export type PlayerApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

const handler: NextApiHandlerIO<PlayerApiResponse> = (req, res) => {
	if (req.method === 'DELETE') return handleDelete(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	res.status(405).end();
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

		res.json({ status: 'success' });

		const listeners = res.socket.server.io.to(`portrait${playerId}`).to('admin');

		if (!npcId) {
			if (maxSlots !== undefined) listeners.emit('playerSpellSlotsChange', playerId, maxSlots);
			if (maxLoad !== undefined) listeners.emit('playerMaxLoadChange', playerId, maxLoad);
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

		res.json({ status: 'success' });

		res.socket.server.io.to(`player${playerId}`).emit('playerDelete');
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
