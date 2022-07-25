import type { Characteristic } from '@prisma/client';
import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type CharacteristicSheetApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ characteristic: Characteristic }
>;

const handler: NextApiHandler = (req, res) => {
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePost: NextApiHandler<CharacteristicSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id || !req.body.name)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);
	const name = String(req.body.name);

	try {
		const characteristic = await prisma.characteristic.update({
			where: { id },
			data: { name },
		});

		res.json({ status: 'success', characteristic });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandler<CharacteristicSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.name)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const name = String(req.body.name);

	try {
		const players = await prisma.player.findMany({
			where: { role: { in: ['PLAYER', 'NPC'] } },
			select: { id: true },
		});

		const characteristic = await prisma.characteristic.create({
			data: {
				name,
				PlayerCharacteristic: {
					createMany: {
						data: players.map(({ id: player_id }) => ({ player_id })),
					},
				},
			},
		});

		res.json({ status: 'success', characteristic });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandler<CharacteristicSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const characteristic = await prisma.characteristic.delete({ where: { id } });
		res.json({ status: 'success', characteristic });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
