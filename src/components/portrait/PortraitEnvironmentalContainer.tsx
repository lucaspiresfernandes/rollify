import Fade from '@mui/material/Fade';
import { Fragment, useEffect, useRef, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import type { SocketIO } from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.css';
import { clamp } from '../../utils';
import {
	Environment,
	getAttributeStyle,
	portraitEnvironmentOrientation,
} from '../../utils/portrait';

const bounds = {
	top: 0,
	bottom: 450,
	left: -400,
	right: 0,
};

type PortraitEnvironmentalContainerProps = {
	socket: SocketIO;
	environment: Environment;
	attributes: PortraitAttributesContainerProps['attributes'];
	playerName: PortraitNameContainerProps['playerName'];
	playerId: number;
	debug: boolean;
	nameOrientation: typeof portraitEnvironmentOrientation[number];
};

const PortraitEnvironmentalContainer: React.FC<PortraitEnvironmentalContainerProps> = (props) => {
	const [environment, setEnvironment] = useState(props.environment);

	useEffect(() => {
		props.socket.on('environmentChange', (newValue) => setEnvironment(newValue));
		return () => {
			props.socket.off('environmentChange');
		};
	}, [props.socket]);

	let divStyle: React.CSSProperties = { width: 800 };

	props.nameOrientation === 'Direita'
		? (divStyle = { ...divStyle, left: 430, textAlign: 'start' })
		: (divStyle = { ...divStyle, left: 0, textAlign: 'end' });

	return (
		<div className={styles.container} style={divStyle}>
			<PortraitAttributesContainer
				environment={environment}
				attributes={props.attributes}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
			/>
			<PortraitNameContainer
				environment={environment}
				playerName={props.playerName}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
			/>
		</div>
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
};

const PortraitAttributesContainer: React.FC<PortraitAttributesContainerProps> = (props) => {
	const [attributes, setAttributes] = useState(props.attributes);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setPosition(
			(JSON.parse(localStorage.getItem('attribute-pos') || 'null') as typeof position) || {
				x: 0,
				y: 300,
			}
		);
	}, []);

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

	const onDragStop: DraggableEventHandler = (_ev, data) => {
		const pos = {
			x: clamp(data.x, bounds.left, bounds.right),
			y: clamp(data.y, bounds.top, bounds.bottom),
		};
		setPosition(pos);
		localStorage.setItem('attribute-pos', JSON.stringify(pos));
	};

	return (
		<Fade in={props.debug || props.environment === 'combat'}>
			<div>
				<Draggable
					axis='both'
					position={position}
					bounds={bounds}
					onStop={onDragStop}
					nodeRef={ref}>
					<div className={styles.combat} ref={ref}>
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
};

const PortraitNameContainer: React.FC<PortraitNameContainerProps> = (props) => {
	const [playerName, setPlayerName] = useState(props.playerName);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setPosition(
			(JSON.parse(localStorage.getItem('name-pos') || 'null') as typeof position) || {
				x: 0,
				y: 300,
			}
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const onDragStop: DraggableEventHandler = (_ev, data) => {
		const pos = {
			x: clamp(data.x, bounds.left, bounds.right),
			y: clamp(data.y, bounds.top, bounds.bottom),
		};
		setPosition(pos);
		localStorage.setItem('name-pos', JSON.stringify(pos));
	};

	return (
		<Fade in={props.debug || props.environment === 'idle'}>
			<div>
				<Draggable
					axis='both'
					position={position}
					bounds={bounds}
					onStop={onDragStop}
					nodeRef={ref}>
					<div ref={ref} className={styles.nameContainer}>
						<label className={`${styles.name} nome`}>
							{playerName.show ? playerName.name || 'Desconhecido' : '???'}
						</label>
					</div>
				</Draggable>
			</div>
		</Fade>
	);
};

export default PortraitEnvironmentalContainer;
