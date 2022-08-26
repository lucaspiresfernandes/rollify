import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';

import PlayerSheet from '../../../../components/sheet/Page1';
import type { DiceConfig } from '../../../../utils/dice';
import type { InferSsrProps } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionSsr } from '../../../../utils/session';
import type { GeneralConfig } from '../../../../utils/settings';

export type SheetFirstPageProps = InferSsrProps<typeof getSsp>;

const SheetFirstPage: NextPage<SheetFirstPageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Character Sheet - Rollify</title>
			</Head>
			<PlayerSheet {...props} isNpc={true} />
		</>
	);
};

async function getSsp(ctx: GetServerSidePropsContext) {
	const player = ctx.req.session.player;

	if (!player || !player.admin) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	const npcId = parseInt(ctx.query.id as string);

	const results = await prisma.$transaction([
		prisma.player.findUnique({
			where: { id: npcId },
			select: {
				id: true,
				name: true,
				showName: true,
				maxLoad: true,
				spellSlots: true,
				PlayerInfo: { select: { Info: true, value: true } },
				PlayerAvatar: { select: { AttributeStatus: true, link: true } },
				PlayerAttributes: {
					select: { Attribute: true, value: true, maxValue: true, extraValue: true, show: true },
				},
				PlayerAttributeStatus: { select: { AttributeStatus: true, value: true } },
				PlayerSpec: { select: { Spec: true, value: true } },
				PlayerCharacteristic: {
					select: { Characteristic: true, value: true, modifier: true, checked: true },
				},
				PlayerWeapon: { select: { Weapon: true, currentAmmo: true, currentDescription: true } },
				PlayerArmor: { select: { Armor: true, currentDescription: true } },
				PlayerSkill: {
					select: { Skill: true, value: true, checked: true, modifier: true, favourite: true },
				},
				PlayerCurrency: { select: { value: true, Currency: true } },
				PlayerItem: { select: { Item: true, currentDescription: true, quantity: true } },
				PlayerSpell: { include: { Spell: true } },
			},
		}),
		prisma.config.findUnique({ where: { name: 'dice' } }),
		prisma.config.findUnique({ where: { name: 'general' } }),
	]);

	if (!results[0]) {
		ctx.req.session.destroy();
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../../../../i18n/${locale}`);

	return {
		props: {
			player: results[0],
			diceConfig: JSON.parse(results[1]?.value as string) as DiceConfig,
			section: (JSON.parse(results[2]?.value as string) as GeneralConfig).section,
			table,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default SheetFirstPage;
