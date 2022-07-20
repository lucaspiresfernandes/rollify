import type { IronSessionData } from 'iron-session';
import { useEffect, useState } from 'react';
import createApiClient from '../utils/createApiClient';

type Session = IronSessionData['player'];

const api = createApiClient();

export default function useSession() {
	const [session, setSession] = useState<Session>();

	useEffect(() => {
		api.get('/player').then((res) => setSession(res.data.player));
	}, []);

	return session;
}
