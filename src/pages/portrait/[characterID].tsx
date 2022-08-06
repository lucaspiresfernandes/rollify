import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import PortraitAvatarContainer from '../../components/portrait/PortraitAvatarContainer';
import PortraitDiceContainer from '../../components/portrait/PortraitDiceContainer';
import PortraitEnvironmentalContainer from '../../components/portrait/PortraitEnvironmentalContainer';
import PortraitSideAttributeContainer from '../../components/portrait/PortraitSideAttributeContainer';
import type { SocketIO } from '../../hooks/useSocket';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import styles from '../../styles/modules/Portrait.module.css';
import type { InferSsrProps } from '../../utils/next';
import type { Environment, PortraitFontConfig } from '../../utils/portrait';
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
	const { t } = useI18n<Locale>();

	useEffect(() => {
		setRotation(parseInt(JSON.parse(localStorage.getItem('environment-rot') || 'null') || 0));
	}, []);

	const handleRotationChange = (_: Event, val: number | number[]) => {
		setRotation(val as number);
		localStorage.setItem('environment-rot', JSON.stringify(val));
	};

	return (
		<div className={styles.container}>
			<PortraitMainContainer {...props} rotation={rotation} debug={debug} />
			<div className={styles.editor}>
				<div style={{ marginBottom: 8 }}>
					<Button
						variant='contained'
						title='Desativa o controle do ambiente pelo mestre.'
						onClick={() => setDebug((e) => !e)}>
						{debug ? t('disable') : t('enable')} Editor
					</Button>
				</div>
				{debug && (
					<div style={{ width: 360 }}>
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
		</div>
	);
};

type PortraitDiceRollContainerProps = PageProps & {
	socket: SocketIO;
	rotation: number;
	debug: boolean;
};

const PortraitMainContainer: React.FC<PortraitDiceRollContainerProps> = (props) => {
	const [showDice, setShowDice] = useState(false);

	return (
		<>
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
				<PortraitEnvironmentalContainer
					attributes={props.attributes.map((attr) => ({ ...attr, ...attr.Attribute }))}
					environment={props.environment || 'idle'}
					playerId={props.playerId}
					playerName={props.playerName}
					socket={props.socket}
					rotation={props.rotation}
					debug={props.debug}
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
		</>
	);
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
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
			environment: results[1]?.value as Environment | undefined,
			attributes,
			sideAttribute,
			attributeStatus: results[0].PlayerAttributeStatus,
			playerName: { name: results[0].name, show: results[0].showName },
			customFont: JSON.parse(results[2]?.value || 'null') as PortraitFontConfig | null,
			diceColor,
			showDiceRoll,
		},
	};
}

export default PortraitPage;
