import type { Skill } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionApi } from '../../../utils/session';

export type SkillSheetApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{
		skill: (Skill & {
			Specialization: {
				name: string;
			} | null;
		})[];
	}
>;

const handler: NextApiHandlerIO = (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(405).end();
};

const handleGet: NextApiHandlerIO<SkillSheetApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const player_id = npcId || player.id;

	const skill = await prisma.skill.findMany({
		where: { PlayerSkill: { none: { player_id } } },
		include: { Specialization: { select: { name: true } } },
	});

	res.json({ status: 'success', skill });
};

const handlePost: NextApiHandlerIO<SkillSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.id ||
		!req.body.name ||
		req.body.startValue === undefined ||
		req.body.mandatory === undefined ||
		req.body.specializationId === undefined ||
		req.body.visibleToAdmin === undefined
	) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const id = Number(req.body.id);
	const name = String(req.body.name);
	const startValue = Number(req.body.startValue);
	const specialization_id =
		req.body.specializationId === null ? null : Number(req.body.specializationId);
	const mandatory = Boolean(req.body.mandatory);
	const visibleToAdmin = Boolean(req.body.visibleToAdmin);

	try {
		const skill = await prisma.skill.update({
			where: { id },
			data: { name, startValue, specialization_id, mandatory, visibleToAdmin },
			include: { Specialization: true },
		});

		res.json({ status: 'success', skill: [skill] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handlePut: NextApiHandlerIO<SkillSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (
		!req.body.name ||
		req.body.startValue === undefined ||
		req.body.mandatory === undefined ||
		req.body.specializationId === undefined ||
		req.body.visibleToAdmin === undefined
	) {
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});
	}

	const name = String(req.body.name);
	const startValue = Number(req.body.startValue);
	const specialization_id =
		req.body.specializationId === null ? null : Number(req.body.specializationId);
	const mandatory = Boolean(req.body.mandatory);
	const visibleToAdmin = Boolean(req.body.visibleToAdmin);

	try {
		const skill = await prisma.skill.create({
			data: { name, startValue, specialization_id, mandatory, visibleToAdmin },
			include: { Specialization: true },
		});

		res.json({ status: 'success', skill: [skill] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

const handleDelete: NextApiHandlerIO<SkillSheetApiResponse> = async (req, res) => {
	const player = req.session.player;

	if (!player || !player.admin) return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const id = Number(req.body.id);

	try {
		const skill = await prisma.skill.delete({ where: { id } });
		res.json({ status: 'success', skill: [{ ...skill, Specialization: null }] });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
