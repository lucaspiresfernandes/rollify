import Fade from '@mui/material/Fade';
import { useI18n } from 'next-rosetta';
import { Fragment, useEffect, useRef, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import type { SocketIO } from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import styles from '../../styles/modules/Portrait.module.css';
import { clamp } from '../../utils';
import { Environment, getAttributeStyle } from '../../utils/portrait';

const bounds = {
	bottom: 600,
	left: -420,
	top: 150,
	right: 420,
};

type PortraitEnvironmentalContainerProps = {
	socket: SocketIO;
	environment: Environment;
	attributes: PortraitAttributesContainerProps['attributes'];
	playerName: PortraitNameContainerProps['playerName'];
	playerId: number;
	rotation: number;
	debug: boolean;
};

const PortraitEnvironmentalContainer: React.FC<PortraitEnvironmentalContainerProps> = (props) => {
	const [environment, setEnvironment] = useState(props.environment);

	useEffect(() => {
		props.socket.on('environmentChange', (newValue) => setEnvironment(newValue));
		return () => {
			props.socket.off('environmentChange');
		};
	}, [props.socket]);

	return (
		<>
			<PortraitAttributesContainer
				environment={environment}
				attributes={props.attributes}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
				rotation={props.rotation}
			/>
			<PortraitNameContainer
				environment={environment}
				playerName={props.playerName}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
				rotation={props.rotation}
			/>
		</>
	);
};

type PortraitAttributesContainerProps = {
	socket: SocketIO;
	environment: Environment;
	attributes: {
		id: number;
		name: string;
		color: string;
		value: number;
		maxValue: number;
		show: boolean;
	}[];
	playerId: number;
	debug: boolean;
	rotation: number;
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
		props.socket.on('playerAttributeChange', (playerId, attributeId, value, maxValue, show) => {
			if (playerId !== props.playerId) return;
			setAttributes((attributes) =>
				attributes.map((attr) => {
					if (attr.id === attributeId) return { ...attr, value, maxValue, show };
					return attr;
				})
			);
		});

		return () => {
			props.socket.off('playerAttributeChange');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.socket]);

	useEffect(() => {
		if (attributesRef.current) {
			attributesRef.current.style.transform = `rotate(${props.rotation}deg)`;
		}
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
					<div className={styles.combatDraggable}>
						<div className={styles.combatContainer}>
							<div ref={attributesRef} style={{ display: 'inline-block' }}>
								{attributes.map((attr) => (
									<Fragment key={attr.id}>
										<span
											className={`${styles.attribute} atributo-primario ${attr.name}`}
											style={getAttributeStyle(attr.color)}>
											<label>{attr.show ? `${attr.value}/${attr.maxValue}` : '?/?'}</label>
										</span>
										<br />
									</Fragment>
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
	socket: SocketIO;
	environment: Environment;
	playerName: { name: string; show: boolean };
	playerId: number;
	debug: boolean;
	rotation: number;
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
		props.socket.on('playerNameChange', (playerId, name) => {
			if (playerId !== props.playerId) return;
			setPlayerName((pn) => ({ ...pn, name }));
		});

		props.socket.on('playerNameShowChange', (playerId, show) => {
			if (playerId !== props.playerId) return;
			setPlayerName((pn) => ({ ...pn, show }));
		});

		return () => {
			props.socket.off('playerNameChange');
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.socket]);

	useEffect(() => {
		if (nameRef.current) {
			nameRef.current.style.transform = `rotate(${props.rotation}deg)`;
		}
	}, [props.rotation]);

	const onDragStop: DraggableEventHandler = (_ev, data) => {
		const pos = {
			x: clamp(data.x, bounds.left, bounds.right),
			y: clamp(data.y, bounds.top, bounds.bottom),
		};
		setTransform(pos);
		localStorage.setItem(`name-pos-${props.playerId}`, JSON.stringify(pos));
	};

	const alignment: React.CSSProperties['textAlign'] = transform.x > 150 ? 'start' : 'end';

	return (
		<Fade in={props.debug || props.environment === 'idle'}>
			<div style={{ textAlign: alignment }}>
				<Draggable axis='both' position={transform} bounds={bounds} onStop={onDragStop}>
					<div className={styles.nameDraggable}>
						<div className={styles.nameContainer}>
							<div ref={nameRef} style={{ display: 'inline-block' }}>
								<label className={styles.name}>
									{playerName.show ? playerName.name || t('unknown') : '???'}
								</label>
							</div>
						</div>
					</div>
				</Draggable>
			</div>
		</Fade>
	);
};

export default PortraitEnvironmentalContainer;
