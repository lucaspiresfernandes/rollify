import { useTheme } from '@mui/material';
import Slider from '@mui/material/Slider';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { useEffect, useState } from 'react';
import PortraitAvatarContainer from '../../components/portrait/PortraitAvatarContainer';
import PortraitDiceContainer from '../../components/portrait/PortraitDiceContainer';
import PortraitEnvironmentalContainer from '../../components/portrait/PortraitEnvironmentalContainer';
import PortraitSideAttributeContainer from '../../components/portrait/PortraitSideAttributeContainer';
import type { SocketIO } from '../../hooks/useSocket';
import useSocket from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.css';
import type { InferSsrProps } from '../../utils/next';
import type { Environment, PortraitConfig } from '../../utils/portrait';
import prisma from '../../utils/prisma';

type PageProps = InferSsrProps<typeof getServerSideProps>;

const PortraitPage: NextPage<PageProps> = (props) => {
	const socket = useSocket(`portrait${props.playerId}`);

	useEffect(() => {
		document.body.style.backgroundColor = 'transparent';
		document.body.style.color = 'white';
	}, []);

	useEffect(() => {
		if (props.portraitConfig?.customFont) {
			const font = new FontFace(
				'Portrait Custom Font',
				`url(${props.portraitConfig.customFont.data})`
			);

			font
				.load()
				.then((f) => {
					document.fonts.add(f);
					document.body.style.fontFamily = 'Portrait Custom Font';
				})
				.catch((err) => console.warn('Could not load custom font:', err));
		} else document.body.style.fontFamily = 'FantaisieArtistique';
	}, [props.portraitConfig]);

	return (
		<div className={styles.container}>
			<CharacterPortrait {...props} socket={socket} />
		</div>
	);
};

const CharacterPortrait: React.FC<PageProps & { socket: SocketIO | null }> = (props) => {
	const [editor, setEditor] = useState(false);
	const [rotation, setRotation] = useState(0);

	useEffect(() => {
		setRotation(
			parseInt(JSON.parse(localStorage.getItem(`portrait-rot${props.playerId}`) || 'null') || 0)
		);
	}, [props.playerId]);

	const handleRotationChange = (_: Event, val: number | number[]) => {
		setRotation(val as number);
		localStorage.setItem(`portrait-rot${props.playerId}`, JSON.stringify(val));
	};

	return (
		<>
			<PortraitMainContainer
				{...props}
				rotation={rotation}
				editor={editor}
				onToggleEditor={() => setEditor((e) => !e)}
			/>
			<div className={styles.editor}>
				{editor && (
					<div style={{ width: 360 }}>
						<Slider
							min={0}
							max={360}
							step={5}
							value={rotation}
							onChange={handleRotationChange}
							valueLabelDisplay='auto'
						/>
						<h2>Editor</h2>
					</div>
				)}
			</div>
		</>
	);
};

type PortraitDiceRollContainerProps = PageProps & {
	socket: SocketIO | null;
	rotation: number;
	editor: boolean;
	onToggleEditor: () => void;
};

const PortraitMainContainer: React.FC<PortraitDiceRollContainerProps> = (props) => {
	const [showDice, setShowDice] = useState(false);
	const theme = useTheme();

	const showDuration = props.portraitConfig?.transitions.dice.enterTimeout || 750;
	const hideDuration = props.portraitConfig?.transitions.dice.exitTimeout || 500;

	const transition = theme.transitions.create('filter', {
		duration: showDice ? showDuration : hideDuration,
		easing: showDice ? 'ease-out' : 'ease-in',
	});

	const style: React.CSSProperties = {
		filter: `brightness(${showDice ? '25%' : '100%'})`,
		transition,
	};

	return (
		<>
			<div style={style}>
				<PortraitAvatarContainer
					playerId={props.playerId}
					attributeStatus={props.attributeStatus}
					socket={props.socket}
					onToggleEditor={props.onToggleEditor}
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
					debug={props.editor}
					lockEnvironment={props.lockEnvironment}
					typography={props.portraitConfig?.typography}
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
				diceTransition={props.portraitConfig?.transitions.dice}
			/>
		</>
	);
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const playerId = parseInt(ctx.query.characterID as string);
	const lockEnvironment = (ctx.query.environment as Environment) || null;
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
						extraValue: true,
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
		prisma.config.findUnique({ where: { name: 'portrait' } }),
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

	const locale = ctx.locale || ctx.defaultLocale;
	const { table = {} } = await import(`../../i18n/${locale}`);

	return {
		props: {
			table,
			playerId,
			environment: (results[1]?.value || null) as Environment | null,
			attributes,
			sideAttribute,
			attributeStatus: results[0].PlayerAttributeStatus,
			playerName: { name: results[0].name, show: results[0].showName },
			portraitConfig: JSON.parse(results[2]?.value || 'null') as PortraitConfig | null,
			diceColor,
			showDiceRoll,
			lockEnvironment,
		},
	};
}

export default PortraitPage;
