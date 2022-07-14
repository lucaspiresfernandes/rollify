import type { IronSessionData } from 'iron-session';
import { useEffect, useState } from 'react';
import api from '../utils/api';

type Session = IronSessionData['player'];

export default function useSession() {
	const [session, setSession] = useState<Session>();

	useEffect(() => {
		api.get('/player').then((res) => setSession(res.data.player));
	}, []);

	return session;
}
