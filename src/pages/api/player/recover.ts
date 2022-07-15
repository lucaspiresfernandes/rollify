import type { NextApiHandler } from 'next';
import { withSessionApi } from '../../../utils/session';

type PlayerRecoverResponse = {
};

const handler: NextApiHandler<PlayerRecoverResponse> = (req, res) => {
    if (req.method === 'PUT') return handlePut(req, res);
    if (req.method === 'POST') return handlePost(req, res);
	res.status(405).end();
};

const handlePut: NextApiHandler<PlayerRecoverResponse> = (req, res) => {
    
};

const handlePost: NextApiHandler<PlayerRecoverResponse> = (req, res) => {

};

export default withSessionApi(handler);
