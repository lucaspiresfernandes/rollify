import type { NextApiHandlerIO, NextApiResponseData } from '../../../../../utils/next';
import prisma from '../../../../../utils/prisma';
import { withSessionApi } from '../../../../../utils/session';

export type PlayerGetAvatarApiResponse = NextApiResponseData<
	'avatar_not_found' | 'invalid_player_id',
	{ link: string }
>;

const handler: NextApiHandlerIO<PlayerGetAvatarApiResponse> = async (req, res) => {
	const playerID =
		parseInt(req.query.playerID as string) || req.body.npcId || req.session.player?.id;
	const statusID = parseInt(req.query.attrStatusID as string) || null;

	if (!playerID)
		return res.json({
			status: 'failure',
			reason: 'invalid_player_id',
		});

	try {
		let avatar = await prisma.playerAvatar.findFirst({
			where: {
				player_id: playerID,
				attribute_status_id: statusID,
			},
			select: { link: true },
		});

		if (avatar === null || avatar.link === null) {
			if (statusID === null)
				return res.json({
					status: 'failure',
					reason: 'avatar_not_found',
				});

			const defaultAvatar = await prisma.playerAvatar.findFirst({
				where: {
					player_id: playerID,
					attribute_status_id: null,
				},
				select: { link: true },
			});

			if (defaultAvatar === null || defaultAvatar.link === null)
				return res.json({
					status: 'failure',
					reason: 'avatar_not_found',
				});

			avatar = defaultAvatar;
		}

		res.json({ status: 'success', link: avatar.link as string });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
