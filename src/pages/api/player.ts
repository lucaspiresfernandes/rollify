import type { IronSessionData } from 'iron-session';
import type { NextApiHandler } from 'next';
import { withSessionApi } from '../../utils/session';

type PlayerGetResponse = {
	player: IronSessionData['player'];
};

const handler: NextApiHandler<PlayerGetResponse> = (req, res) => {
	if (req.method === 'GET') return res.json({ player: req.session.player });

	if (req.method === 'DELETE') {
		req.session.destroy();
		return res.end();
	}

	res.status(405).end();
};

export default withSessionApi(handler);
