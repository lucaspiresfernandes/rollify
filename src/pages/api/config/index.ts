import type { NextApiHandlerIO, NextApiResponseData } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import customBehaviours from './customBehaviours';

//Available settings
// - Dice
// - Portrait

export type ConfigResponse = NextApiResponseData<'invalid_name_or_value'>;

const handler: NextApiHandlerIO<ConfigResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const name: string = req.body.name;
	let value: string | undefined = undefined;

	if (req.body.value !== undefined) {
		if (typeof req.body.value === 'object') value = JSON.stringify(req.body.value);
		else value = String(req.body.value);
	}

	if (!name || value === undefined)
		return res.json({
			status: 'failure',
			reason: 'invalid_name_or_value',
		});

	try {
		await prisma.config.upsert({
			where: { name },
			update: { value },
			create: { name, value },
		});

		const behaviour = customBehaviours.get(name);
		if (behaviour) await behaviour(res, req.body.value);

		res.json({ status: 'success' });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default handler;
