import { useEffect, useState } from 'react';
import type { ControlPosition, DraggableEventHandler } from 'react-draggable';
import Draggable from 'react-draggable';
import type { SocketIO } from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.css';
import { clamp } from '../../utils';

const bounds = {
	bottom: 600,
	left: -320,
	top: 0,
	right: 320,
};

type PortraitSideAttributeContainerProps = {
	playerId: number;
	socket: SocketIO | null;
	sideAttribute: {
		id: number;
		name: string;
		color: string;
		value: number;
		extraValue: number;
		show: boolean;
	} | null;
};

const PortraitSideAttributeContainer: React.FC<PortraitSideAttributeContainerProps> = (props) => {
	const [sideAttribute, setSideAttribute] = useState(props.sideAttribute);
	const [position, setPosition] = useState<ControlPosition>({ x: 0, y: 0 });

	useEffect(() => {
		setPosition(
			(JSON.parse(
				localStorage.getItem(`side-attribute-pos-${props.playerId}`) || 'null'
			) as ControlPosition) || {
				x: 0,
				y: 420,
			}
		);
	}, [props.playerId]);

	useEffect(() => {
		const socket = props.socket;
		if (!socket) return;

		socket.on('playerAttributeChange', (playerId, attributeId, value, _, extraValue, show) => {
			if (playerId !== props.playerId) return;
			setSideAttribute((attr) => {
				if (attr === null || attributeId !== attr.id) return attr;
				return { ...attr, value, extraValue, show };
			});
		});

		return () => {
			socket.off('playerAttributeChange');
		};
	}, [props.socket, props.playerId]);

	if (!sideAttribute) return null;

	const onDragStop: DraggableEventHandler = (_, data) => {
		const pos = {
			x: clamp(data.x, bounds.left, bounds.right),
			y: clamp(data.y, bounds.top, bounds.bottom),
		};
		setPosition(pos);
		localStorage.setItem(`side-attribute-pos-${props.playerId}`, JSON.stringify(pos));
	};

	const color = sideAttribute?.color || 'ffffff';

	return (
		<Draggable axis='both' onStop={onDragStop} position={position} bounds={bounds}>
			<div
				className={styles.draggable}
				style={{ textShadow: `0 0 10px #${color}, 0 0 30px #${color}, 0 0 50px #${color}` }}>
				<div className={styles.sideContainer}>
					<div className={styles.sideBackground}></div>
					<label className={`${styles.sideContent} atributo-secundario ${sideAttribute.name}`}>
						{sideAttribute.show ? sideAttribute.value + sideAttribute.extraValue : '?'}
					</label>
				</div>
			</div>
		</Draggable>
	);
};

export default PortraitSideAttributeContainer;
