import type { IronSessionOptions } from 'iron-session';
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import type {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextApiHandler
} from 'next';
import type { NextApiHandlerIO } from './next';

export const cookieName = 'openrpg_session';

declare module 'iron-session' {
	interface IronSessionData {
		player?: {
			id: number;
			admin: boolean;
		};
	}
}

const sessionOptions: IronSessionOptions = {
	cookieName,
	password: process.env.SESSION_SECRET as string,
	cookieOptions: {
		secure: false,
	},
};

export function withSessionApi(handler: NextApiHandler | NextApiHandlerIO) {
	return withIronSessionApiRoute(handler as NextApiHandler, sessionOptions);
}

export function withSessionSsr<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
	handler: (
		ctx: GetServerSidePropsContext
	) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
	return withIronSessionSsr(handler, sessionOptions);
}
