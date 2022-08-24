import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';

import PlayerSheetPage2 from '../../../components/sheet/Page2';
import type { InferSsrProps } from '../../../utils/next';
import prisma from '../../../utils/prisma';
import { withSessionSsr } from '../../../utils/session';
import type { GeneralConfig } from '../../../utils/settings';

export type SheetSecondPageProps = InferSsrProps<typeof getSsp>;

const SheetSecondPage: NextPage<SheetSecondPageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Character Sheet - Rollify</title>
			</Head>
			<PlayerSheetPage2 {...props} isNpc={false} />
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
				PlayerNote: { select: { value: true } },
				PlayerExtraInfo: {
					select: { value: true, ExtraInfo: { select: { id: true, name: true } } },
				},
			},
		}),
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
	const { table = {} } = await import(`../../../i18n/${locale}`);

	return {
		props: {
			player: results[0],
			section: (JSON.parse(results[1]?.value as string) as GeneralConfig).section,
			table,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default SheetSecondPage;
