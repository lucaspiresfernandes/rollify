import type { NextApiHandler } from 'next';
import type { NextApiResponseData } from '../../utils/next';
import type { Presets } from '../../utils/presets';
import prisma from '../../utils/prisma';

export type BootApiResponse = NextApiResponseData<
	'already_booted' | 'invalid_preset_id' | 'invalid_locale',
	{ init: boolean }
>;

const handler: NextApiHandler<BootApiResponse> = async (req, res) => {
	if (req.method === 'GET') return handleGet(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	return res.status(405).end();
};

const handleGet: NextApiHandler<BootApiResponse> = async (_, res) => {
	const init = (await prisma.config.findUnique({ where: { name: 'init' } }))?.value === 'true';
	return res.json({ status: 'success', init });
};

const handlePost: NextApiHandler<BootApiResponse> = async (req, res) => {
	const config = await prisma.config.findUnique({ where: { name: 'init' } });

	if (config && config.value === 'true')
		return res.json({ status: 'failure', reason: 'already_booted' });

	const locale = String(req.body.locale) || 'en';

	const presets = (await import(`../../utils/presets/${locale}.json`).then(
		(mod) => mod.default
	)) as Presets | undefined;

	if (!presets) return res.json({ status: 'failure', reason: 'invalid_locale' });

	const presetId = req.body.presetId || presets[0].preset_id;

	const preset = presets?.find((p) => p.preset_id === presetId);

	if (!preset) return res.json({ status: 'failure', reason: 'invalid_preset_id' });

	try {
		await prisma.$transaction([
			prisma.config.createMany({
				data: [{ id: 1, name: 'init', value: 'true' }, ...preset.config],
			}),
			prisma.info.createMany({ data: preset.info }),
			prisma.extraInfo.createMany({ data: preset.extraInfo }),
			prisma.attribute.createMany({ data: preset.attribute }),
			prisma.spec.createMany({ data: preset.spec }),
			prisma.characteristic.createMany({ data: preset.characteristic }),
			prisma.currency.createMany({ data: preset.currency }),
			prisma.specialization.createMany({ data: preset.specialization }),
			prisma.weapon.createMany({ data: preset.weapon }),
			prisma.armor.createMany({ data: preset.armor }),
			prisma.item.createMany({ data: preset.item }),
			prisma.spell.createMany({ data: preset.spell }),
		]);

		await prisma.$transaction([
			prisma.attributeStatus.createMany({ data: preset.attribute_status }),
			prisma.skill.createMany({ data: preset.skill }),
		]);

		res.json({ status: 'success', init: true });
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

export default handler;
