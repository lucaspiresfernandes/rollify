import type { PlayerSkill, Skill } from '@prisma/client';
import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type PlayerSkillApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_body',
	{
		skill: PlayerSkill & { Skill: Skill };
	}
>;

const handler: NextApiHandlerIO<PlayerSkillApiResponse> = (req, res) => {
	if (req.method === 'POST') return handlePost(req, res);
	return res.status(405).end();
};

const handlePost: NextApiHandlerIO<PlayerSkillApiResponse> = async (req, res) => {
	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	if (!req.body.id) res.json({ status: 'failure', reason: 'invalid_body' });

	const skill_id = Number(req.body.id);
	const player_id = npcId || player.id;

	const value = req.body.value === undefined ? undefined : Number(req.body.value);
	const checked = req.body.checked === undefined ? undefined : Boolean(req.body.checked);
	const modifier = req.body.modifier === undefined ? undefined : Number(req.body.modifier);
	const favourite = req.body.favourite === undefined ? undefined : Boolean(req.body.favourite);

	try {
		const skill = await prisma.playerSkill.update({
			where: { player_id_skill_id: { player_id, skill_id } },
			data: { value, checked, modifier, favourite },
			include: { Skill: true },
		});

		res.json({
			status: 'success',
			skill,
		});

		res.socket.server.io.emit(
			'playerSkillChange',
			player_id,
			skill_id,
			skill.value,
			skill.modifier
		);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
