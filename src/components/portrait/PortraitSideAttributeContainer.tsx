import { useEffect, useMemo, useRef, useState } from 'react';
import type { ControlPosition, DraggableEventHandler } from 'react-draggable';
import Draggable from 'react-draggable';
import type { SocketIO } from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.css';
import { clamp } from '../../utils';
import { getAttributeStyle } from '../../utils/portrait';

const bounds = {
	bottom: 600,
	left: -320,
	top: 65,
	right: 320,
};

type PortraitSideAttributeContainerProps = {
	playerId: number;
	socket: SocketIO;
	sideAttribute: {
		id: number;
		name: string;
		color: string;
		value: number;
		show: boolean;
	} | null;
};

const PortraitSideAttributeContainer: React.FC<PortraitSideAttributeContainerProps> = (props) => {
	const [sideAttribute, setSideAttribute] = useState(props.sideAttribute);
	const [position, setPosition] = useState<ControlPosition>({ x: 0, y: 0 });
	const ref = useRef<HTMLDivElement>(null);

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
		props.socket.on('playerAttributeChange', (playerId, attributeId, value, _, show) => {
			if (playerId !== props.playerId) return;
			setSideAttribute((attr) => {
				if (attr === null || attributeId !== attr.id) return attr;
				return { ...attr, value, show };
			});
		});

		return () => {
			props.socket.off('playerAttributeChange');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.socket]);

	const attributeStyle = useMemo(
		() => getAttributeStyle(sideAttribute?.color || 'ffffff'),
		[sideAttribute]
	);

	if (!sideAttribute) return null;

	const onDragStop: DraggableEventHandler = (_, data) => {
		const pos = {
			x: clamp(data.x, bounds.left, bounds.right),
			y: clamp(data.y, bounds.top, bounds.bottom),
		};
		setPosition(pos);
		localStorage.setItem(`side-attribute-pos-${props.playerId}`, JSON.stringify(pos));
	};

	return (
		<Draggable axis='both' onStop={onDragStop} position={position} bounds={bounds} nodeRef={ref}>
			<div className={styles.sideDraggable} style={{ ...attributeStyle }} ref={ref}>
				<div className={styles.sideContainer}>
					<div className={styles.sideBackground}></div>
					<label className={`${styles.sideContent} atributo-secundario ${sideAttribute.name}`}>
						{sideAttribute.show ? sideAttribute.value : '?'}
					</label>
				</div>
			</div>
		</Draggable>
	);
};

export default PortraitSideAttributeContainer;
