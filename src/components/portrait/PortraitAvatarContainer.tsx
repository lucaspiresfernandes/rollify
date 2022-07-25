import Fade from '@mui/material/Fade';
import { useEffect, useRef, useState } from 'react';
import type { SocketIO } from '../../hooks/useSocket';
import type { PlayerGetAvatarApiResponse } from '../../pages/api/sheet/player/avatar/[attrStatusID]';
import styles from '../../styles/modules/Portrait.module.css';
import { getAvatarSize } from '../../utils';
import { api } from '../../utils/createApiClient';

const AVATAR_SIZE = getAvatarSize(1);

export type PortraitAttributeStatus = {
	value: boolean;
	attribute_status_id: number;
}[];

type PortraitAvatarContainerProps = {
	attributeStatus: PortraitAttributeStatus;
	playerId: number;
	socket: SocketIO;
};

const PortraitAvatarContainer: React.FC<PortraitAvatarContainerProps> = (props) => {
	const [src, setSrc] = useState('/avatar404.png');
	const [showAvatar, setShowAvatar] = useState(false);
	const [attributeStatus, setAttributeStatus] = useState(props.attributeStatus);
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		const id = attributeStatus.find((stat) => stat.value)?.attribute_status_id || 0;

		if (id === previousStatusID.current) return;

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
	}, [attributeStatus, props.playerId]);

	useEffect(() => {
		props.socket.on('playerAttributeStatusChange', (playerId, id, value) => {
			if (playerId !== props.playerId) return;
			setAttributeStatus((status) =>
				status.map((stat) => {
					if (stat.attribute_status_id === id) return { ...stat, value };
					return stat;
				})
			);
		});

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
};

export default PortraitAvatarContainer;
