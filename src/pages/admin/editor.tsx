import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import ArmorEditorContainer from '../../components/admin/editor/ArmorEditorContainer';
import AttributeEditorContainer from '../../components/admin/editor/AttributeEditorContainer';
import CharacteristicEditorContainer from '../../components/admin/editor/CharacteristicEditorContainer';
import CurrencyEditorContainer from '../../components/admin/editor/CurrencyEditorContainer';
import ExtraInfoEditorContainer from '../../components/admin/editor/ExtraInfoEditorContainer';
import InfoEditorContainer from '../../components/admin/editor/InfoEditorContainer';
import ItemEditorContainer from '../../components/admin/editor/ItemEditorContainer';
import SkillEditorContainer from '../../components/admin/editor/SkillEditorContainer';
import SpecEditorContainer from '../../components/admin/editor/SpecEditorContainer';
import SpellEditorContainer from '../../components/admin/editor/SpellEditorContainer';
import WeaponEditorContainer from '../../components/admin/editor/WeaponEditorContainer';
import type { Locale } from '../../i18n';
import type { InferSsrProps } from '../../utils/next';
import prisma from '../../utils/prisma';
import { withSessionSsr } from '../../utils/session';

type AdminEditorPageProps = InferSsrProps<typeof getSsp>;

const AdminEditorPage: NextPage<AdminEditorPageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Editor - Rollify</title>
			</Head>
			<AdminEditor {...props} />
		</>
	);
};

const AdminEditor: React.FC<AdminEditorPageProps> = (props) => {
	const { t } = useI18n<Locale>();

	return (
		<Container sx={{ my: 2 }}>
			<Grid container pt={2} spacing={5} justifyContent='center'>
				<Grid item xs={12} md={6}>
					<InfoEditorContainer info={props.info} />
				</Grid>

				<Grid item xs={12} md={6}>
					<ExtraInfoEditorContainer extraInfo={props.extraInfo} />
				</Grid>

				<AttributeEditorContainer
					attribute={props.attribute}
					attributeStatus={props.attributeStatus}
				/>

				<Grid item xs={12} md={6}>
					<SpecEditorContainer spec={props.spec} />
				</Grid>

				<Grid item xs={12} md={6}>
					<CharacteristicEditorContainer characteristic={props.characteristic} />
				</Grid>

				<Grid item xs={12} md={6}>
					<SkillEditorContainer skill={props.skill} />
				</Grid>

				<Grid item xs={12} md={6}>
					<WeaponEditorContainer weapon={props.weapon} />
				</Grid>

				<Grid item xs={12} md={6}>
					<ArmorEditorContainer armor={props.armor} />
				</Grid>

				<Grid item xs={12} md={6}>
					<CurrencyEditorContainer currency={props.currency} />
				</Grid>

				<Grid item xs={12} md={6}>
					<ItemEditorContainer item={props.item} />
				</Grid>

				<Grid item xs={12} md={6}>
					<SpellEditorContainer spell={props.spell} />
				</Grid>
			</Grid>
		</Container>
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

	const results = await prisma.$transaction([
		prisma.info.findMany(),
		prisma.extraInfo.findMany(),
		prisma.attribute.findMany(),
		prisma.attributeStatus.findMany(),
		prisma.spec.findMany(),
		prisma.characteristic.findMany(),
		prisma.weapon.findMany(),
		prisma.armor.findMany(),
		prisma.skill.findMany(),
		prisma.item.findMany(),
		prisma.spell.findMany(),
		prisma.currency.findMany(),
	]);

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../../i18n/${locale}`);

	return {
		props: {
			table,
			info: results[0],
			extraInfo: results[1],
			attribute: results[2],
			attributeStatus: results[3],
			spec: results[4],
			characteristic: results[5],
			weapon: results[6],
			armor: results[7],
			skill: results[8],
			item: results[9],
			spell: results[10],
			currency: results[11],
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default AdminEditorPage;
