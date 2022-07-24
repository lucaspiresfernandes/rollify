import type { IronSessionData } from 'iron-session';
import { useEffect, useState } from 'react';
import type { PlayerApiGetResponse } from '../pages/api/player';
import { api } from '../utils/createApiClient';

type Session = IronSessionData['player'];

export default function useSession(...dependencies: any[]) {
	const [session, setSession] = useState<Session>();

	useEffect(() => {
		api.get<PlayerApiGetResponse>('/player').then((res) => setSession(res.data.player));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	return session;
}
