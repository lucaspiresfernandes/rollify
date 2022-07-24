import { useEffect, useState } from 'react';
import type { BootApiResponse } from '../pages/api/boot';
import { api } from '../utils/createApiClient';

export default function useBoot() {
	const [boot, setBoot] = useState<boolean>();

	useEffect(() => {
		api.get<BootApiResponse>('/boot').then((res) => {
			if (res.data.status === 'success') return setBoot(res.data.init);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	});

	return boot;
}
