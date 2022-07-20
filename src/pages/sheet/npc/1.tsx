import type { GetServerSidePropsContext, NextPage } from 'next';

import ApplicationHead from '../../../components/ApplicationHead';
import PlayerSheet from '../../../components/sheet/Page1';
import SnackbarContainer from '../../../components/SnackbarContainer';
import { LoggerContext } from '../../../contexts';
import useSnackbar from '../../../hooks/useSnackbar';
import type { DiceConfig } from '../../../utils/dice';
import type { InferSsrProps } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionSsr } from '../../../utils/session';

export type SheetFirstPageProps = InferSsrProps<typeof getSsp>;

const SheetFirstPage: NextPage<SheetFirstPageProps> = (props) => {
	const [snackbarProps, updateSnackbar] = useSnackbar();

	return (
		<>
			<ApplicationHead title='Character Sheet' />
			<LoggerContext.Provider value={updateSnackbar}>
				<PlayerSheet {...props} isNpc={true} />
			</LoggerContext.Provider>
			<SnackbarContainer {...snackbarProps} />
		</>
	);
};

async function getSsp(ctx: GetServerSidePropsContext) {
	const player = ctx.req.session.player;

	if (!player) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	const results = await prisma.$transaction([
		prisma.player.findUnique({
			where: { id: player.id },
			select: {
				id: true,
				name: true,
				showName: true,
				maxLoad: true,
				spellSlots: true,
				PlayerInfo: { select: { Info: true, value: true } },
				PlayerAvatar: { select: { AttributeStatus: true, link: true } },
				PlayerAttributes: {
					select: { Attribute: true, value: true, maxValue: true, show: true },
				},
				PlayerAttributeStatus: { select: { AttributeStatus: true, value: true } },
				PlayerSpec: { select: { Spec: true, value: true } },
				PlayerCharacteristic: {
					select: { Characteristic: true, value: true, modifier: true },
				},
				PlayerEquipment: { select: { Equipment: true, currentAmmo: true } },
				PlayerSkill: {
					select: {
						Skill: {
							select: {
								id: true,
								name: true,
								Specialization: { select: { name: true } },
							},
						},
						value: true,
						checked: true,
						modifier: true,
					},
				},
				PlayerCurrency: { select: { value: true, Currency: true } },
				PlayerItem: { select: { Item: true, currentDescription: true, quantity: true } },
				PlayerSpell: { select: { Spell: true } },
			},
		}),
		prisma.equipment.findMany({
			where: { visible: true, PlayerEquipment: { none: { player_id: player.id } } },
		}),
		prisma.skill.findMany({
			where: { PlayerSkill: { none: { player_id: player.id } } },
			select: {
				id: true,
				name: true,
				Specialization: {
					select: {
						name: true,
					},
				},
			},
		}),
		prisma.item.findMany({
			where: { visible: true, PlayerItem: { none: { player_id: player.id } } },
		}),
		prisma.spell.findMany({
			where: { visible: true, PlayerSpell: { none: { player_id: player.id } } },
		}),
		prisma.config.findUnique({ where: { name: 'dice' } }),
		prisma.config.findUnique({ where: { name: 'enable_automatic_markers' } }),
		prisma.player.findMany({
			where: {
				role: { in: ['PLAYER'] },
				id: { not: player.id },
			},
			select: {
				id: true,
				name: true,
			},
		}),
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
	const { table = {} } = await import(`../../../i18n/${locale}`);

	return {
		props: {
			player: results[0],
			availableEquipments: results[1],
			availableSkills: results[2],
			availableItems: results[3],
			availableSpells: results[4],
			diceConfig: JSON.parse(results[5]?.value || 'null') as DiceConfig,
			automaticMarking: results[6]?.value === 'true' ? true : false,
			partners: results[7],
			table,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default SheetFirstPage;
