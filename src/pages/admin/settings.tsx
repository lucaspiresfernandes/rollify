import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import type { Locale } from '../../i18n';
import type { DiceConfig } from '../../utils/dice';
import type { InferSsrProps } from '../../utils/next';
import type { PortraitFontConfig } from '../../utils/portrait';
import prisma from '../../utils/prisma';
import { withSessionSsr } from '../../utils/session';

type AdminSettingsPageProps = InferSsrProps<typeof getSsp>;

const AdminSettingsPage: NextPage<AdminSettingsPageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Settings - Rollify</title>
			</Head>
			<h1>Settings</h1>
		</>
	);
};

const AdminSettings: React.FC<AdminSettingsPageProps> = (props) => {
	const { t } = useI18n<Locale>();

	return (
		<Container sx={{ my: 2 }}>
			<Typography variant='h3' component='h1'>
				{t('admin.configurationsTitle')}
			</Typography>
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
		prisma.config.findUnique({ where: { name: 'admin_key' }, select: { value: true } }),
		prisma.config.findUnique({ where: { name: 'dice' }, select: { value: true } }),
		prisma.config.findUnique({
			where: { name: 'portrait_font' },
			select: { value: true },
		}),
	]);

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../../i18n/${locale}`);

	return {
		props: {
			table,
			adminKey: results[0]?.value || null,
			dice: JSON.parse(results[1]?.value as string) as DiceConfig,
			portraitFont: JSON.parse(results[2]?.value || 'null') as PortraitFontConfig | null,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default AdminSettingsPage;
