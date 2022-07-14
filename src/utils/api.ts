import axios, { AxiosError } from 'axios';
import type { LoggerProp } from '../contexts';

const api = axios.create({
	baseURL: '/api',
});

export function handleErrorDefault(err: AxiosError, logger: LoggerProp) {
	const a = `Ocorreu um erro desconhecido: ${err.message}`;
	logger(a);
}

export default api;
