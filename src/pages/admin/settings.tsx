import CasinoIcon from '@mui/icons-material/Casino';
import SettingsIcon from '@mui/icons-material/Settings';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import { useState } from 'react';
import DiceSettings from '../../components/admin/DiceSettings';
import GeneralSettings from '../../components/admin/GeneralSettings';
import PortraitSettings from '../../components/admin/PortraitSettings';
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
			<AdminSettings {...props} />
		</>
	);
};

const AdminSettings: React.FC<AdminSettingsPageProps> = (props) => {
	const { t } = useI18n<Locale>();
	const [tab, setTab] = useState(0);

	return (
		<Box display='flex'>
			<Tabs
				orientation='vertical'
				variant='scrollable'
				value={tab}
				onChange={(_, val) => setTab(val)}
				sx={{ borderRight: 1, borderColor: 'divider' }}>
				<Tab icon={<SettingsIcon />} label='GENERAL' />
				<Tab icon={<CasinoIcon />} label='DICE' />
				<Tab icon={<VideoCameraFrontIcon />} label='PORTRAIT' />
			</Tabs>

			<Container sx={{ my: 4 }}>
				{tab === 0 && <GeneralSettings adminKey={props.adminKey} />}
				{tab === 1 && <DiceSettings diceConfig={props.dice} />}
				{tab === 2 && <PortraitSettings portraitConfig={props.portraitFont} />}
			</Container>
		</Box>
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
		prisma.config.findUnique({ where: { name: 'adminKey' }, select: { value: true } }),
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
