import type { IronSessionData } from 'iron-session';
import { useEffect, useState } from 'react';
import { api } from '../utils/createApiClient';

type Session = IronSessionData['player'];

export default function useSession(...dependencies: any[]) {
	const [session, setSession] = useState<Session>(undefined);

	useEffect(() => {
		api.get('/player').then((res) => setSession(res.data.player));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);

	return session;
}
