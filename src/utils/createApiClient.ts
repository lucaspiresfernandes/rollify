import axios from 'axios';

const createApiClient: typeof axios.create = (config) =>
	axios.create({ ...config, baseURL: '/api' });
	
//Default API
export const api = createApiClient();

export default createApiClient;
