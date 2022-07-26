import { useEffect, useRef, useState } from 'react';
import type { SocketIO } from '../../hooks/useSocket';
import type { PlayerGetAvatarApiResponse } from '../../pages/api/sheet/player/avatar/[attrStatusID]';
import styles from '../../styles/modules/Portrait.module.css';
import { getAvatarSize } from '../../utils';
import { api } from '../../utils/createApiClient';

const AVATAR_TRANSITION_DURATION = 500;

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
	const [src, setSrc] = useState('#');
	const [oldSrc, setOldSrc] = useState('#');
	const [showAvatar, setShowAvatar] = useState(false);
	const [attributeStatus, setAttributeStatus] = useState(props.attributeStatus);
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		const id = attributeStatus.find((stat) => stat.value)?.attribute_status_id || 0;
		if (id === previousStatusID.current) return;
		previousStatusID.current = id;

		setShowAvatar(false);

		api
			.get<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${id}`, {
				params: { playerID: props.playerId },
			})
			.then(({ data }) => {
				if (data.status === 'failure') return setSrc('/avatar404.png');
				if (data.link === src.split('?')[0]) return setShowAvatar(true);
				setSrc(`${data.link}?v=${Date.now()}`);
			})
			.catch(() => setSrc('/avatar404.png'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	const onImageLoad = () => {
		setShowAvatar(true);
		setTimeout(() => setOldSrc(src), AVATAR_TRANSITION_DURATION);
	};

	const onImageLoadError = () => {
		setShowAvatar(true);
		setSrc('/avatar404.png');
		setTimeout(() => setOldSrc('/avatar404.png'), AVATAR_TRANSITION_DURATION);
	};

	return (
		<div>
			<img
				src={oldSrc}
				alt='Old Avatar'
				width={AVATAR_SIZE[0]}
				height={AVATAR_SIZE[1]}
				className={styles.oldAvatar}
			/>
			<img
				src={src}
				alt='Avatar'
				width={AVATAR_SIZE[0]}
				height={AVATAR_SIZE[1]}
				onLoad={onImageLoad}
				onError={onImageLoadError}
				className={showAvatar ? `${styles.avatar} ${styles.show}` : styles.avatar}
			/>
		</div>
	);
};

export default PortraitAvatarContainer;
