import type { NextApiHandler } from 'next';
import type { AsyncReturnType } from '../../utils';
import type { NextApiResponseData } from '../../utils/next';
import prisma from '../../utils/prisma';
import { withSessionApi } from '../../utils/session';
import { registerSheetData } from './register';

function getNpc(id: number) {
	return prisma.player.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			PlayerAttributeStatus: {
				select: { AttributeStatus: { select: { id: true } }, value: true },
			},
			PlayerAttributes: {
				select: {
					Attribute: { select: { id: true, name: true, color: true } },
					value: true,
					maxValue: true,
					extraValue: true,
				},
			},
		},
	});
}

export type NpcApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{ npc: AsyncReturnType<typeof getNpc> }
>;

const handler: NextApiHandler = (req, res) => {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handlePut: NextApiHandler<NpcApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) {
		return res.json({
			status: 'failure',
			reason: 'unauthorized',
		});
	}

	if (!req.body.name) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	try {
		const name = String(req.body.name);
		const id = await registerSheetData(undefined, { name });
		const npc = await getNpc(id);
		res.json({ status: 'success', npc });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandler<NpcApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) {
		return res.json({
			status: 'failure',
			reason: 'unauthorized',
		});
	}

	if (!req.body.id) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const id = Number(req.body.id);

	try {
		await prisma.player.delete({ where: { id } });
		res.json({ status: 'success', npc: null });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
