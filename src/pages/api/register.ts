import type { PlayerAvatar } from '@prisma/client';
import type { NextApiHandler } from 'next';
import { hash } from '../../utils/encryption';
import type { NextApiResponseData } from '../../utils/next';
import prisma from '../../utils/prisma';
import { withSessionApi } from '../../utils/session';

export type RegisterResponse = NextApiResponseData<
	'invalid_credentials' | 'user_already_exists' | 'invalid_admin_key',
	{ id: number; isAdmin: boolean }
>;

async function validateAdminKey(key: string) {
	const admin = await prisma.player.findMany({ where: { role: 'ADMIN' } });

	if (admin.length === 0) return true;

	const serverAdminKey = (await prisma.config.findUnique({ where: { name: 'admin_key' } }))?.value;

	if (key === serverAdminKey) return true;
	return false;
}

const handler: NextApiHandler<RegisterResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	if (!req.body.email || !req.body.password)
		return res.json({ status: 'failure', reason: 'invalid_credentials' });

	const email = String(req.body.email);
	const plainPassword = String(req.body.password);
	const adminKey = req.body.adminKey === undefined ? undefined : String(req.body.adminKey);

	try {
		const user = await prisma.player.findUnique({ where: { email } });

		if (user) return res.json({ status: 'failure', reason: 'user_already_exists' });

		let isAdmin = false;
		if (adminKey !== undefined) {
			isAdmin = await validateAdminKey(adminKey);
			if (!isAdmin) return res.json({ status: 'failure', reason: 'invalid_admin_key' });
		}

		const hashword = hash(plainPassword);

		let playerId: number;
		if (isAdmin) playerId = await registerAdminData(email, hashword);
		else playerId = await registerSheetData({ email, password: hashword });

		req.session.player = {
			id: playerId,
			admin: isAdmin,
		};
		await req.session.save();

		res.json({ status: 'success', id: playerId, isAdmin });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export async function registerSheetData(
	credentials?: {
		email: string;
		password: string;
	},
	options?: { name: string }
) {
	const results = await prisma.$transaction([
		prisma.info.findMany({ select: { id: true } }),
		prisma.attribute.findMany({ select: { id: true } }),
		prisma.attributeStatus.findMany({ select: { id: true } }),
		prisma.spec.findMany({ select: { id: true } }),
		prisma.characteristic.findMany({ select: { id: true } }),
		prisma.skill.findMany({ select: { id: true, startValue: true } }),
		prisma.extraInfo.findMany({ select: { id: true } }),
		prisma.currency.findMany({ select: { id: true } }),
	]);

	const player = await prisma.player.create({
		data: {
			email: credentials?.email,
			password: credentials?.password,
			name: options?.name,
			role: credentials ? 'PLAYER' : 'NPC',
			PlayerInfo: { createMany: { data: results[0].map((i) => ({ info_id: i.id })) } },
			PlayerAttributes: {
				createMany: { data: results[1].map((a) => ({ attribute_id: a.id })) },
			},
			PlayerAttributeStatus: {
				createMany: { data: results[2].map((a) => ({ attribute_status_id: a.id })) },
			},
			PlayerAvatar: {
				createMany: {
					data: results[2]
						.map<Omit<PlayerAvatar, 'id' | 'player_id'>>((attrStatus) => ({
							attribute_status_id: attrStatus.id,
							link: null,
						}))
						.concat({
							attribute_status_id: null,
							link: null,
						}),
				},
			},
			PlayerSpec: { createMany: { data: results[3].map((s) => ({ spec_id: s.id })) } },
			PlayerCharacteristic: {
				createMany: { data: results[4].map((c) => ({ characteristic_id: c.id })) },
			},
			PlayerSkill: {
				createMany: {
					data: results[5].map((s) => ({ skill_id: s.id, value: s.startValue })),
				},
			},
			PlayerExtraInfo: {
				createMany: { data: results[6].map((e) => ({ extra_info_id: e.id, value: '' })) },
			},
			PlayerCurrency: {
				createMany: { data: results[7].map((c) => ({ currency_id: c.id })) },
			},
			PlayerNote: { create: { value: '' } },
		},
		select: { id: true },
	});

	return player.id;
}

async function registerAdminData(email: string, hashword: string) {
	const player = await prisma.player.create({
		data: {
			email,
			password: hashword,
			role: 'ADMIN',
			PlayerNote: { create: { value: '' } },
		},
		select: { id: true },
	});
	return player.id;
}

export default withSessionApi(handler);
