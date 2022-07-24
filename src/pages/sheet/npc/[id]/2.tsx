import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';

import ApplicationHead from '../../../../components/ApplicationHead';
import PlayerSheetPage2 from '../../../../components/sheet/Page2';
import SnackbarContainer from '../../../../components/SnackbarContainer';
import { LoggerContext } from '../../../../contexts';
import useSnackbar from '../../../../hooks/useSnackbar';
import type { Locale } from '../../../../i18n';
import type { InferSsrProps } from '../../../../utils/next';
import prisma from '../../../../utils/prisma';
import { withSessionSsr } from '../../../../utils/session';

export type SheetSecondPageProps = InferSsrProps<typeof getSsp>;

const SheetSecondPage: NextPage<SheetSecondPageProps> = (props) => {
	const [snackbarProps, updateSnackbar] = useSnackbar();
	const { t } = useI18n<Locale>();

	return (
		<>
			<ApplicationHead title={t('sheet.playerTitle')} />
			<LoggerContext.Provider value={updateSnackbar}>
				<PlayerSheetPage2 {...props} />
			</LoggerContext.Provider>
			<SnackbarContainer {...snackbarProps} />
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
				PlayerNote: { select: { value: true } },
				PlayerExtraInfo: {
					select: { value: true, ExtraInfo: { select: { id: true, name: true } } },
				},
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
	const { table = {} } = await import(`../../../../i18n/${locale}`);

	return {
		props: {
			player: results[0],
			table,
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default SheetSecondPage;
