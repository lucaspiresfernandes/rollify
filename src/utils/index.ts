import type { AxiosResponse } from 'axios';
import type { RosettaExtended } from 'next-rosetta';
import type { LoggerContextType } from '../contexts';
import type { Locale } from '../i18n';
import type { NextApiResponseData } from './next';

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
	...args: any
) => Promise<infer R>
	? R
	: any;

export const TRADE_TIME_LIMIT = 10000;

export const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function handleDefaultApiResponse<
	T extends NextApiResponseData<'unauthorized' | 'invalid_body'>
>(res: AxiosResponse<T>, log: LoggerContextType, t: RosettaExtended<Locale>['t']) {
	if (res.data.status === 'success') return;

	switch (res.data.reason) {
		case 'invalid_body':
			return log({ severity: 'error', text: t('error.invalidBody') });
		case 'unauthorized':
			return log({ severity: 'error', text: t('error.unauthorized') });
		default:
			return log({ severity: 'error', text: t('error.unknown', { message: res.data.reason }) });
	}
}

export function getAvatarSize(ratio: number): [number, number] {
	return [420 * ratio, 600 * ratio];
}

export function clamp(num: number, min: number, max: number) {
	if (num < min) return min;
	if (num > max) return max;
	return num;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms));
}
