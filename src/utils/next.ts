import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from './socket';

export type NextApiHandlerIO<T = any> = (
	req: NextApiRequest,
	res: NextApiResponseServerIO<T>
) => unknown | Promise<unknown>;

type NextApiResponseSuccess<D extends object> = { status: 'success' } & {
	[K in keyof D]: D[K];
};

type NextApiResponseFailure<R> = { status: 'failure'; reason: R };

export type NextApiResponseData<R = string, D extends object = {}> =
	| NextApiResponseSuccess<D>
	| NextApiResponseFailure<'unknown_error' | R>;

type GetSsrResult<TProps> = { props: TProps } | { redirect: any } | { notFound: true };

type GetSsrFn<TProps extends any> = (args: any) => Promise<GetSsrResult<TProps>>;

export type InferSsrProps<TFn extends GetSsrFn<any>> = TFn extends GetSsrFn<infer TProps>
	? NonNullable<TProps>
	: never;
