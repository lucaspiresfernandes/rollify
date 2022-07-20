import type { AxiosResponse } from 'axios';
import type { LoggerContextType } from '../contexts';
import type { NextApiResponseData } from './next';

export const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function handleDefaultApiResponse<
	T extends NextApiResponseData<'unauthorized' | 'invalid_body'>
>(res: AxiosResponse<T>, log: LoggerContextType) {
	if (res.data.status === 'success') return;

	switch (res.data.reason) {
		case 'invalid_body':
			return log({ severity: 'error', text: 'Invalid body' });
		case 'unauthorized':
			return log({ severity: 'error', text: 'Unauthorized' });
		default:
			return log({ severity: 'error', text: 'Unknown error: ' + res.data.reason });
	}
}

export function clamp(num: number, min: number, max: number) {
	if (num < min) return min;
	if (num > max) return max;
	return num;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms));
}
