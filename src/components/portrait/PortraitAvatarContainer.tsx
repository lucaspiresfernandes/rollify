import Fade from '@mui/material/Fade';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import type { SocketIO } from '../../hooks/useSocket';
import type { PlayerGetAvatarApiResponse } from '../../pages/api/sheet/player/avatar/[attrStatusID]';
import styles from '../../styles/modules/Portrait.module.css';
import { api } from '../../utils/createApiClient';

const AVATAR_TRANSITION_DURATION = 500;

export type PortraitAttributeStatus = {
	value: boolean;
	attribute_status_id: number;
}[];

type PortraitAvatarContainerProps = {
	attributeStatus: PortraitAttributeStatus;
	playerId: number;
	socket: SocketIO | null;
	onToggleEditor: () => void;
};

const PortraitAvatarContainer: React.FC<PortraitAvatarContainerProps> = (props) => {
	const [src, setSrc] = useState('#');
	const [oldSrc, setOldSrc] = useState('#');
	const [showAvatar, setShowAvatar] = useState(false);
	const [showOldAvatar, setShowOldAvatar] = useState(false);
	const [attributeStatus, setAttributeStatus] = useState(props.attributeStatus);
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		const id = attributeStatus.find((stat) => stat.value)?.attribute_status_id || 0;
		if (id === previousStatusID.current) return;
		previousStatusID.current = id;

		const controller = new AbortController();

		api
			.get<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${id}`, {
				params: { playerID: props.playerId },
				signal: controller.signal,
			})
			.then(({ data }) => {
				if (data.status === 'failure') return setSrc('/avatar404.webp');
				if (data.link === src.split('?')[0]) return;
				setShowOldAvatar(true);
				setShowAvatar(false);
				setSrc(data.link);
			})
			.catch((err) => {
				console.log('fetch error');
				if (axios.isCancel(err)) return console.log('Cancelled');
				setSrc('/avatar404.webp');
			});

		return () => {
			controller.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [attributeStatus, props.playerId]);

	useEffect(() => {
		const socket = props.socket;
		if (!socket) return;

		socket.on('playerAttributeStatusChange', (playerId, id, value) => {
			if (playerId !== props.playerId) return;
			setAttributeStatus((status) =>
				status.map((stat) => {
					if (stat.attribute_status_id === id) return { ...stat, value };
					return stat;
				})
			);
		});

		return () => {
			socket.off('playerAttributeStatusChange');
		};
	}, [props.socket, props.playerId]);

	const onImageLoadError = () => {
		if (src === '#') return;
		setSrc('/avatar404.webp');
	};

	return (
		<>
			<img
				hidden={!showOldAvatar}
				src={oldSrc}
				alt='Avatar Placeholder'
				className={styles.oldAvatar}
			/>
			<Fade
				in={showAvatar}
				timeout={{ enter: AVATAR_TRANSITION_DURATION, exit: 0 }}
				onEntered={() => {
					setOldSrc(src);
					setShowOldAvatar(false);
				}}>
				<img
					src={src}
					alt='Avatar'
					onLoad={() => setShowAvatar(true)}
					onError={onImageLoadError}
					onDoubleClick={props.onToggleEditor}
					className={styles.avatar}
				/>
			</Fade>
		</>
	);
};

export default PortraitAvatarContainer;
