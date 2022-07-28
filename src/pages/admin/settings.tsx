import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
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
		prisma.config.findUnique({
			where: { name: 'enable_success_types' },
			select: { value: true },
		}),
		prisma.config.findUnique({ where: { name: 'dice' }, select: { value: true } }),
		prisma.attribute.findMany({ where: { portrait: 'PRIMARY' } }),
		prisma.attribute.findFirst({ where: { portrait: 'SECONDARY' } }),
		prisma.attribute.findMany(),
		prisma.config.findUnique({
			where: { name: 'enable_automatic_markers' },
			select: { value: true },
		}),
		prisma.config.findUnique({
			where: { name: 'portrait_font' },
			select: { value: true },
		}),
	]);

	return {
		props: {
			adminKey: results[0]?.value || '',
			enableSuccessTypes: results[1]?.value === 'true',
			dice: JSON.parse(results[2]?.value || 'null') as DiceConfig,
			portrait: {
				attributes: results[3],
				side_attribute: results[4],
			},
			attributes: results[5],
			automaticMarking: results[6]?.value === 'true' ? true : false,
			portraitFont: JSON.parse(results[7]?.value || 'null') as PortraitFontConfig,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default AdminSettingsPage;
