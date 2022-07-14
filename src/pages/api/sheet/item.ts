import type { Item } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type ItemSheetApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ item: Item }
>;

const handler: NextApiHandlerIO = (req, res) => {
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePost: NextApiHandlerIO<ItemSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.id ||
		!req.body.name ||
		!req.body.description ||
		req.body.weight === undefined ||
		req.body.visible === undefined
	) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const id = Number(req.body.id);
	const name = String(req.body.name);
	const description = String(req.body.description);
	const weight = Number(req.body.weight);
	const visible = Boolean(req.body.visible);

	try {
		const item = await prisma.item.update({
			where: { id },
			data: { name, description, weight, visible },
		});

		res.json({ status: 'success', item });

		res.socket.server.io.emit('itemChange', item);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<ItemSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.name ||
		!req.body.description ||
		req.body.weight === undefined ||
		req.body.visible === undefined
	) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const name = String(req.body.name);
	const description = String(req.body.description);
	const weight = Number(req.body.weight);
	const visible = Boolean(req.body.visible);

	try {
		const item = await prisma.item.create({
			data: {
				name,
				description,
				weight,
				visible,
			},
		});

		res.json({ status: 'success', item });

		res.socket.server.io.emit('itemAdd', item.id, item.name);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<ItemSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const item = await prisma.item.delete({ where: { id } });
		res.json({ status: 'success', item });
		res.socket.server.io.emit('itemRemove', id);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
