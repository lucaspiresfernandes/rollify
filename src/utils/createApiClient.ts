import axios, { AxiosRequestTransformer } from 'axios';

const createApiClient: typeof axios.create = (config) => {
	const aux = config?.transformRequest as AxiosRequestTransformer[];

	return axios.create({
		...config,
		transformRequest: aux
			? [...aux, ...(axios.defaults.transformRequest as AxiosRequestTransformer[])]
			: undefined,
		baseURL: '/api',
	});
};

//Default API
export const api = createApiClient();

export default createApiClient;
