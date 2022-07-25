import Fade from '@mui/material/Fade';
import { useEffect, useRef, useState } from 'react';
import type { SocketIO } from '../../hooks/useSocket';
import type { PlayerGetAvatarApiResponse } from '../../pages/api/sheet/player/avatar/[attrStatusID]';
import styles from '../../styles/modules/Portrait.module.css';
import { getAvatarSize } from '../../utils';
import { api } from '../../utils/createApiClient';
import type { PlayerAttributeStatusChangeEvent } from '../../utils/socket';

const AVATAR_SIZE = getAvatarSize(1);

export type PortraitAttributeStatus = {
	value: boolean;
	attribute_status_id: number;
}[];

export default function PortraitAvatar(props: {
	attributeStatus: PortraitAttributeStatus;
	playerId: number;
	socket: SocketIO;
}) {
	const [src, setSrc] = useState('/avatar404.png');
	const [showAvatar, setShowAvatar] = useState(false);
	const [attributeStatus, setAttributeStatus] = useState(props.attributeStatus);
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		const id = attributeStatus.find((stat) => stat.value)?.attribute_status_id || 0;
		previousStatusID.current = id;
		api
			.get<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${id}`, {
				params: { playerID: props.playerId },
			})
			.then(({ data }) => {
				if (data.status === 'success') {
					setSrc(`${data.link}?v=${Date.now()}`);
					return;
				}
				setSrc('/avatar404.png');
			})
			.catch(() => setSrc('/avatar404.png'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const socket_playerAttributeStatusChange = useRef<PlayerAttributeStatusChangeEvent>(() => {});

	useEffect(() => {
		socket_playerAttributeStatusChange.current = (playerId, id, value) => {
			if (playerId !== props.playerId) return;
			const newStatus = [...attributeStatus];

			const index = newStatus.findIndex((stat) => stat.attribute_status_id === id);
			if (index === -1) return;

			newStatus[index].value = value;

			const newStatusID = newStatus.find((stat) => stat.value)?.attribute_status_id || 0;
			setAttributeStatus(newStatus);

			if (newStatusID !== previousStatusID.current) {
				previousStatusID.current = newStatusID;
				api
					.get(`/sheet/player/avatar/${newStatusID}`, {
						params: { playerID: props.playerId },
					})
					.then((res) => {
						if (res.data.link === src.split('?')[0]) return;
						setShowAvatar(false);
						setSrc(`${res.data.link}?v=${Date.now()}`);
					})
					.catch(() => setSrc('/avatar404.png'));
			}
		};
	});

	useEffect(() => {
		props.socket.on('playerAttributeStatusChange', (playerId, id, value) =>
			socket_playerAttributeStatusChange.current(playerId, id, value)
		);

		return () => {
			props.socket.off('playerAttributeStatusChange');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.socket]);

	return (
		<Fade in={showAvatar}>
			<div>
				<img
					src={src}
					alt='Avatar'
					width={AVATAR_SIZE[0]}
					height={AVATAR_SIZE[1]}
					onError={() => setSrc('/avatar404.png')}
					onLoad={() => setShowAvatar(true)}
					className={styles.avatar}
				/>
			</div>
		</Fade>
	);
}
