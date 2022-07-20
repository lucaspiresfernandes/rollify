import type { NextApiHandler } from 'next';
import { compare } from '../../utils/encryption';
import type { NextApiResponseData } from '../../utils/next';
import prisma from '../../utils/prisma';
import { withSessionApi } from '../../utils/session';

export type LoginResponse = NextApiResponseData<
	'invalid_email_or_password',
	{ id: number; isAdmin: boolean }
>;

const handler: NextApiHandler<LoginResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	if (!req.body.email || !req.body.password)
		return res.json({ status: 'failure', reason: 'invalid_email_or_password' });

	const email = String(req.body.email);
	const plainPassword = String(req.body.password);

	try {
		const user = await prisma.player.findUnique({
			where: { email },
			select: { id: true, password: true, role: true },
		});

		if (!user || !user.password)
			return res.json({ status: 'failure', reason: 'invalid_email_or_password' });

		const isValidPassword = compare(plainPassword, user.password);

		if (!isValidPassword)
			return res.json({ status: 'failure', reason: 'invalid_email_or_password' });

		const isAdmin = user.role === 'ADMIN';

		req.session.player = {
			id: user.id,
			admin: isAdmin,
		};
		await req.session.save();

		res.json({ status: 'success', id: user.id, isAdmin });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default withSessionApi(handler);
