import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import InfoEditorContainer from '../../components/admin/editor/InfoEditorContainer';
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
			<Box textAlign='center'>
				<Typography variant='h3' component='h1'>
					{t('admin.editorTitle')}
				</Typography>
			</Box>

			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<InfoEditorContainer title='Info' info={props.info} />
				</Grid>
				<Grid item xs={12} md={6}>
					Extra Info
				</Grid>
				<Grid item xs={12} md={6}>
					Attributes & Attribute Status
				</Grid>
				<Grid item xs={12} md={6}>
					Specs
				</Grid>
				<Grid item xs={12} md={6}>
					Characteristics
				</Grid>
				<Grid item xs={12} md={6}>
					Currency
				</Grid>
				<Grid item xs={12} md={6}>
					Skills and Specializations
				</Grid>
				<Grid item xs={12} md={6}>
					Weapons
				</Grid>
				<Grid item xs={12} md={6}>
					Armor
				</Grid>
				<Grid item xs={12} md={6}>
					Items
				</Grid>
				<Grid item xs={12} md={6}>
					Spells
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
		prisma.specialization.findMany(),
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
			specialization: results[10],
			spell: results[11],
			currency: results[12],
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default AdminEditorPage;
