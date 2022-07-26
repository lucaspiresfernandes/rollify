import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import type { PortraitAttributeStatus } from '../../components/portrait/PortraitAvatarContainer';
import PortraitAvatarContainer from '../../components/portrait/PortraitAvatarContainer';
import PortraitDiceContainer from '../../components/portrait/PortraitDiceContainer';
import PortraitEnvironmentalContainer from '../../components/portrait/PortraitEnvironmentalContainer';
import PortraitSideAttributeContainer from '../../components/portrait/PortraitSideAttributeContainer';
import type { SocketIO } from '../../hooks/useSocket';
import useSocket from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.css';
import type { InferSsrProps } from '../../utils/next';
import type {
	Environment,
	portraitEnvironmentOrientation,
	PortraitFontConfig,
} from '../../utils/portrait';
import prisma from '../../utils/prisma';

type PageProps = InferSsrProps<typeof getServerSideProps>;

const PortraitPage: NextPage<PageProps> = (props) => {
	const socket = useSocket(`portrait${props.playerId}`);

	useEffect(() => {
		document.body.style.backgroundColor = 'transparent';

		if (props.customFont) {
			const font = new FontFace('Rollify Custom Font', `url(${props.customFont.data})`);
			font.load().then(() => {
				document.fonts.add(font);
				document.body.classList.add('custom-font');
			});
		} else {
			document.body.style.fontFamily = 'FantaisieArtistique';
		}
	}, [props.customFont]);

	if (!socket) return <LoadingScreen />;

	return <CharacterPortrait {...props} socket={socket} />;
};

const CharacterPortrait: React.FC<PageProps & { socket: SocketIO }> = (props) => {
	const [debug, setDebug] = useState(false);
	const [rotation, setRotation] = useState(0);

	const divStyle: React.CSSProperties =
		props.nameOrientation === 'Direita' ? { left: 20 } : { left: 800 };

	useEffect(() => {
		setRotation(parseInt(JSON.parse(localStorage.getItem('environment-rot') || 'null') || 0));
	}, []);

	const handleRotationChange = (_: Event, val: number | number[]) => {
		setRotation(val as number);
		localStorage.setItem('environment-rot', JSON.stringify(val));
	};

	return (
		<>
			<PortraitDiceRollContainer
				playerId={props.playerId}
				attributeStatus={props.attributeStatus}
				sideAttribute={props.sideAttribute}
				diceColor={props.diceColor}
				showDiceRoll={props.showDiceRoll}
				socket={props.socket}
				nameOrientation={props.nameOrientation}
			/>
			<PortraitEnvironmentalContainer
				attributes={props.attributes.map((attr) => ({ ...attr, ...attr.Attribute }))}
				environment={props.environment}
				playerId={props.playerId}
				playerName={props.playerName}
				socket={props.socket}
				rotation={rotation}
				debug={debug}
				nameOrientation={props.nameOrientation}
			/>
			<div className={styles.editor} style={divStyle}>
				<div style={{ display: 'inline-block', marginRight: 16 }}>
					<Button
						variant='contained'
						title='Desativa o controle do ambiente pelo mestre.'
						onClick={() => setDebug((e) => !e)}>
						TODO: {debug ? 'Desativar' : 'Ativar'} Editor
					</Button>
				</div>
				{debug && (
					<div style={{ display: 'inline-block', width: 360 }}>
						<Slider
							min={0}
							max={360}
							step={5}
							value={rotation}
							onChange={handleRotationChange}
							valueLabelDisplay='auto'
						/>
					</div>
				)}
			</div>
		</>
	);
};

type PortraitDiceRollContainerProps = {
	playerId: number;
	attributeStatus: PortraitAttributeStatus;
	sideAttribute: {
		Attribute: {
			name: string;
			id: number;
			color: string;
		};
		value: number;
		show: boolean;
	} | null;
	diceColor: string;
	showDiceRoll: boolean;
	socket: SocketIO;
	nameOrientation: typeof portraitEnvironmentOrientation[number];
};

const PortraitDiceRollContainer: React.FC<PortraitDiceRollContainerProps> = (props) => {
	const [showDice, setShowDice] = useState(false);

	const divStyle: React.CSSProperties =
		props.nameOrientation === 'Direita' ? { left: 0 } : { left: 800 };

	return (
		<div className={styles.container} style={divStyle}>
			<div className={`${showDice ? 'show ' : ''}shadow`}>
				<PortraitAvatarContainer
					playerId={props.playerId}
					attributeStatus={props.attributeStatus}
					socket={props.socket}
				/>
				<PortraitSideAttributeContainer
					playerId={props.playerId}
					sideAttribute={
						props.sideAttribute
							? { ...props.sideAttribute, ...props.sideAttribute.Attribute }
							: null
					}
					socket={props.socket}
				/>
			</div>
			<PortraitDiceContainer
				playerId={props.playerId}
				color={props.diceColor}
				showDiceRoll={props.showDiceRoll}
				socket={props.socket}
				showDice={showDice}
				onShowDice={() => setShowDice(true)}
				onHideDice={() => setShowDice(false)}
			/>
		</div>
	);
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const nameOrientation =
		(ctx.query.orientation as typeof portraitEnvironmentOrientation[number]) || 'Direita';
	const playerId = parseInt(ctx.query.characterID as string);
	const diceColor = (ctx.query.dicecolor as string) || 'ddaf0f';
	const showDiceRoll = (ctx.query.showdiceroll as string) === 'true';

	const results = await prisma.$transaction([
		prisma.player.findUnique({
			where: { id: playerId },
			select: {
				name: true,
				showName: true,
				role: true,
				PlayerAttributes: {
					where: { Attribute: { portrait: { in: ['PRIMARY', 'SECONDARY'] } } },
					select: {
						value: true,
						maxValue: true,
						show: true,
						Attribute: { select: { id: true, name: true, color: true, portrait: true } },
					},
				},
				PlayerAttributeStatus: {
					select: { value: true, attribute_status_id: true },
				},
			},
		}),
		prisma.config.findUnique({ where: { name: 'environment' } }),
		prisma.config.findUnique({ where: { name: 'portrait_font' } }),
	]);

	if (!results[0] || results[0].role === 'ADMIN')
		return {
			redirect: {
				destination: '/portrait/error',
				permanent: false,
			},
		};

	const attributes = results[0].PlayerAttributes.filter(
		(attr) => attr.Attribute.portrait === 'PRIMARY'
	);

	const sideAttribute =
		results[0].PlayerAttributes.find((attr) => attr.Attribute.portrait === 'SECONDARY') || null;

	return {
		props: {
			playerId,
			environment: (results[1]?.value || 'idle') as Environment,
			attributes,
			sideAttribute,
			attributeStatus: results[0].PlayerAttributeStatus,
			playerName: { name: results[0].name, show: results[0].showName },
			customFont: JSON.parse(results[2]?.value || 'null') as PortraitFontConfig,
			diceColor,
			nameOrientation,
			showDiceRoll,
		},
	};
}

export default PortraitPage;
