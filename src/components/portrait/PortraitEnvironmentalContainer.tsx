import Fade from '@mui/material/Fade';
import { useI18n } from 'next-rosetta';
import { useEffect, useRef, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import type { SocketIO } from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import styles from '../../styles/modules/Portrait.module.css';
import { clamp } from '../../utils';
import {
	DEFAULT_PORTRAIT_CONFIG,
	Environment,
	getShadowStyle,
	PortraitConfig
} from '../../utils/portrait';

const bounds = {
	bottom: 600,
	left: -520,
	top: 96,
	right: 520,
};

type PortraitEnvironmentalContainerProps = {
	socket: SocketIO | null;
	environment: Environment;
	lockEnvironment?: Environment;
	attributes: PortraitAttributesContainerProps['attributes'];
	playerName: PortraitNameContainerProps['playerName'];
	playerId: number;
	rotation: number;
	debug: boolean;
	typography?: Pick<PortraitConfig['typography'], 'attribute' | 'name'>;
};

const PortraitEnvironmentalContainer: React.FC<PortraitEnvironmentalContainerProps> = (props) => {
	const [environment, setEnvironment] = useState(props.lockEnvironment || props.environment);

	useEffect(() => {
		const socket = props.socket;
		if (!socket) return;

		socket.on('environmentChange', (newValue) => {
			if (props.lockEnvironment) return;
			setEnvironment(newValue);
		});
		return () => {
			socket.off('environmentChange');
		};
	}, [props.socket, props.lockEnvironment]);

	return (
		<>
			<PortraitAttributesContainer
				environment={environment}
				attributes={props.attributes}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
				rotation={props.rotation}
				attributeTypography={props.typography?.attribute}
			/>
			<PortraitNameContainer
				environment={environment}
				playerName={props.playerName}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
				rotation={props.rotation}
				nameTypography={props.typography?.name}
			/>
		</>
	);
};

type PortraitAttributesContainerProps = {
	socket: SocketIO | null;
	environment: Environment;
	attributes: {
		id: number;
		name: string;
		color: string;
		value: number;
		extraValue: number;
		maxValue: number;
		show: boolean;
	}[];
	playerId: number;
	debug: boolean;
	rotation: number;
	attributeTypography?: PortraitConfig['typography']['attribute'];
};

const PortraitAttributesContainer: React.FC<PortraitAttributesContainerProps> = (props) => {
	const [attributes, setAttributes] = useState(props.attributes);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const attributesRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setPosition(
			(JSON.parse(
				localStorage.getItem(`attribute-pos-${props.playerId}`) || 'null'
			) as typeof position) || {
				x: 0,
				y: 300,
			}
		);
	}, [props.playerId]);

	useEffect(() => {
		const socket = props.socket;
		if (!socket) return;

		socket.on(
			'playerAttributeChange',
			(playerId, attributeId, value, maxValue, extraValue, show) => {
				if (playerId !== props.playerId) return;
				setAttributes((attributes) =>
					attributes.map((attr) => {
						if (attr.id === attributeId) return { ...attr, value, maxValue, extraValue, show };
						return attr;
					})
				);
			}
		);

		return () => {
			socket.off('playerAttributeChange');
		};
	}, [props.socket, props.playerId]);

	useEffect(() => {
		if (attributesRef.current)
			attributesRef.current.style.transform = `rotate(${props.rotation}deg)`;
	}, [props.rotation]);

	const onDragStop: DraggableEventHandler = (_, data) => {
		const pos = {
			x: clamp(data.x, bounds.left, bounds.right),
			y: clamp(data.y, bounds.top, bounds.bottom),
		};
		setPosition(pos);
		localStorage.setItem(`attribute-pos-${props.playerId}`, JSON.stringify(pos));
	};

	return (
		<Fade in={props.debug || props.environment === 'combat'}>
			<div>
				<Draggable axis='both' position={position} bounds={bounds} onStop={onDragStop}>
					<div className={styles.draggable}>
						<div
							className={styles.attributeContainer}
							style={{
								fontSize:
									props.attributeTypography?.fontSize ||
									DEFAULT_PORTRAIT_CONFIG.typography.attribute.fontSize,
								fontStyle: props.attributeTypography?.italic ? 'italic' : undefined,
							}}>
							<div ref={attributesRef}>
								{attributes.map((attr) => (
									<div key={attr.id} style={getShadowStyle(attr.color)}>
										{attr.show ? (
											<>
												{attr.value + attr.extraValue}/{attr.maxValue}
											</>
										) : (
											'?/?'
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</Draggable>
			</div>
		</Fade>
	);
};

type PortraitNameContainerProps = {
	socket: SocketIO | null;
	environment: Environment;
	playerName: { name: string; show: boolean };
	playerId: number;
	debug: boolean;
	rotation: number;
	nameTypography?: PortraitConfig['typography']['name'];
};

const PortraitNameContainer: React.FC<PortraitNameContainerProps> = (props) => {
	const [playerName, setPlayerName] = useState(props.playerName);
	const [transform, setTransform] = useState({ x: 0, y: 0 });
	const nameRef = useRef<HTMLDivElement>(null);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		setTransform(
			(JSON.parse(
				localStorage.getItem(`name-pos-${props.playerId}`) || 'null'
			) as typeof transform) || {
				x: 0,
				y: 300,
			}
		);
	}, [props.playerId]);

	useEffect(() => {
		const socket = props.socket;
		if (!socket) return;

		socket.on('playerNameChange', (playerId, name) => {
			if (playerId !== props.playerId) return;
			setPlayerName((pn) => ({ ...pn, name }));
		});

		socket.on('playerNameShowChange', (playerId, show) => {
			if (playerId !== props.playerId) return;
			setPlayerName((pn) => ({ ...pn, show }));
		});

		return () => {
			socket.off('playerNameChange');
			socket.off('playerNameShowChange');
		};
	}, [props.socket, props.playerId]);

	useEffect(() => {
		if (nameRef.current) nameRef.current.style.transform = `rotate(${props.rotation}deg)`;
	}, [props.rotation]);

	const onDragStop: DraggableEventHandler = (_ev, data) => {
		const pos = {
			x: clamp(data.x, bounds.left, bounds.right),
			y: clamp(data.y, bounds.top, bounds.bottom),
		};
		setTransform(pos);
		localStorage.setItem(`name-pos-${props.playerId}`, JSON.stringify(pos));
	};

	const rectWidth = nameRef.current?.getBoundingClientRect().width || 0;

	const alignment: React.CSSProperties['textAlign'] =
		transform.x + rectWidth / 2 > 150 ? 'start' : 'end';

	const fullName = playerName.name || t('unknown');

	return (
		<Fade in={props.debug || props.environment === 'idle'}>
			<div>
				<Draggable axis='both' position={transform} bounds={bounds} onStop={onDragStop}>
					<div className={styles.draggable}>
						<div
							className={styles.nameContainer}
							style={{
								fontSize:
									props.nameTypography?.fontSize ||
									DEFAULT_PORTRAIT_CONFIG.typography.name.fontSize,
								fontStyle: props.nameTypography?.italic ? 'italic' : undefined,
							}}>
							<div ref={nameRef} style={{ textAlign: alignment }}>
								{fullName.split(' ').map((name) => (
									<div key={name}>{name}</div>
								))}
							</div>
						</div>
					</div>
				</Draggable>
			</div>
		</Fade>
	);
};

export default PortraitEnvironmentalContainer;
