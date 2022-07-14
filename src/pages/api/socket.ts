import { Server } from 'socket.io';
import type { NextApiHandlerIO } from '../../utils/next';
import type { ClientToServerEvents, ServerToClientEvents } from '../../utils/socket';

const handler: NextApiHandlerIO = (_, res) => {
	if (!res.socket.server.io) {
		const io = new Server<ClientToServerEvents, ServerToClientEvents>(res.socket.server);

		io.on('connection', (socket) => {
			socket.on('roomJoin', (roomName) => socket.join(roomName));
		});

		res.socket.server.io = io;
	}

	res.end();
};

export default handler;
