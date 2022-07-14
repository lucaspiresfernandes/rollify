import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type PlayerPostAvatarApiResponse = NextApiResponseData<'unauthorized' | 'invalid_body'>;

type AvatarData = {
	id: number | null;
	link: string | null;
};

const handler: NextApiHandler<PlayerPostAvatarApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId = Number(req.body.npcId) || undefined;

	if (!player || (player.admin && !npcId))
		return res.json({ status: 'failure', reason: 'unauthorized' });

	const avatarData: AvatarData[] = req.body.avatarData;

	if (!avatarData)
		return res.json({
			status: 'failure',
			reason: 'invalid_body',
		});

	const player_id = npcId || player.id;

	try {
		const avatars = await prisma.playerAvatar.findMany({
			where: { player_id },
			select: { id: true, attribute_status_id: true, link: true },
		});

		if (avatars.length !== avatarData.length)
			return res.json({
				status: 'failure',
				reason: 'invalid_body',
			});

		await Promise.all(
			avatars.map((avatar) => {
				const statusID = avatar.attribute_status_id;
				const newAvatar = avatarData.find((av) => av.id === statusID);

				if (!newAvatar || newAvatar.link === avatar.link) return;

				return prisma.playerAvatar.update({
					where: { id: avatar.id },
					data: { link: newAvatar.link },
				});
			})
		);

		res.json({ status: 'success' });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
