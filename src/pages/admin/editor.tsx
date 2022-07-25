import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import type { InferSsrProps } from '../../utils/next';
import prisma from '../../utils/prisma';
import { withSessionSsr } from '../../utils/session';

type AdminEditorPageProps = InferSsrProps<typeof getSsp>;

const AdminEditorPage: NextPage<AdminEditorPageProps> = (props) => {
	return (
		<>
			<Head>
				<title>Editor</title>
			</Head>
			<h1>Editor</h1>
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
		prisma.info.findMany(),
		prisma.extraInfo.findMany(),
		prisma.attribute.findMany(),
		prisma.attributeStatus.findMany(),
		prisma.spec.findMany(),
		prisma.characteristic.findMany(),
		prisma.equipment.findMany(),
		prisma.skill.findMany(),
		prisma.item.findMany(),
		prisma.specialization.findMany(),
		prisma.spell.findMany(),
		prisma.currency.findMany(),
	]);

	return {
		props: {
			info: results[0],
			extraInfo: results[1],
			attribute: results[2],
			attributeStatus: results[3],
			spec: results[4],
			characteristic: results[5],
			equipment: results[6],
			skill: results[7],
			item: results[8],
			specialization: results[9],
			spell: results[10],
			currency: results[11],
		},
	};
}

export const getServerSideProps = withSessionSsr(getSsp);

export default AdminEditorPage;
