import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SocketIO } from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.css';
import { sleep } from '../../utils';
import type { DiceResponse } from '../../utils/dice';
import { DEFAULT_PORTRAIT_CONFIG, PortraitConfig } from '../../utils/portrait';

type PortraitDiceContainerProps = {
	socket: SocketIO | null;
	playerId: number;
	showDice: boolean;
	onShowDice: () => void;
	onHideDice: () => void;
	color: string;
	showDiceRoll: boolean;
	diceTypography?: PortraitConfig['typography']['dice'];
	diceTransition?: PortraitConfig['transitions']['dice'];
};

type DiceResult = {
	show: boolean;
	roll: number;
	description?: string;
};

const PortraitDiceContainer: React.FC<PortraitDiceContainerProps> = (props) => {
	const [diceResult, setDiceResult] = useState<DiceResult>({
		show: false,
		roll: 0,
	});
	const diceQueue = useRef<DiceResponse[]>([]);
	const diceData = useRef<DiceResponse>();
	const showDiceRef = useRef(props.showDice);
	const diceVideo = useRef<HTMLVideoElement>(null);

	const exitTimeout = useMemo(
		() => props.diceTransition?.exitTimeout || DEFAULT_PORTRAIT_CONFIG.transitions.dice.exitTimeout,
		[props.diceTransition]
	);

	useEffect(() => {
		const socket = props.socket;
		if (!socket || !props.showDiceRoll) return;

		const showDiceRoll = () => {
			if (showDiceRef.current) return;
			showDiceRef.current = true;
			if (diceVideo.current) {
				props.onShowDice();
				diceVideo.current.currentTime = 0;
				diceVideo.current.play();
			}
		};

		const showNextResult = async (result: DiceResponse) => {
			showDiceRoll();
			await sleep(750);
			diceData.current = undefined;
			onDiceResult(result);
		};

		const onDiceResult = async (result: DiceResponse) => {
			if (diceData.current) return diceQueue.current.push(result);
			if (!showDiceRef.current) return showNextResult(result);

			diceData.current = result;

			setDiceResult({
				show: true,
				roll: result.roll,
				description: result.description,
			});

			await sleep(
				props.diceTransition?.screenTimeout ||
					DEFAULT_PORTRAIT_CONFIG.transitions.dice.screenTimeout
			);

			setDiceResult((r) => ({ ...r, show: false }));

			await sleep(100);

			props.onHideDice();

			await sleep(exitTimeout);

			showDiceRef.current = false;

			const next = diceQueue.current.shift();
			if (next) showNextResult(next);
			else diceData.current = undefined;
		};

		socket.on('diceRoll', showDiceRoll);
		socket.on('diceResult', (playerId, results, dices) => {
			if (playerId !== props.playerId) return;

			if (results.length === 1) return onDiceResult(results[0]);

			if (Array.isArray(dices))
				return onDiceResult({
					roll: results.reduce((prev, cur) => prev + cur.roll, 0),
				});

			if (diceData.current) return diceQueue.current.push(...results);
			const first = results.shift();
			if (!first) return;
			diceQueue.current.push(...results);
			onDiceResult(first);
		});

		return () => {
			socket.off('diceRoll');
			socket.off('diceResult');
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.socket, props.showDiceRoll]);

	return (
		<div className={styles.diceContainer}>
			<Zoom
				in={props.showDice}
				easing={{ enter: 'ease-out', exit: 'ease-in' }}
				timeout={{
					enter:
						props.diceTransition?.enterTimeout ||
						DEFAULT_PORTRAIT_CONFIG.transitions.dice.enterTimeout,
					exit: exitTimeout,
				}}>
				<video muted className={styles.dice} ref={diceVideo}>
					<source src='/dice_animation.webm' />
				</video>
			</Zoom>
			<Fade in={diceResult.show}>
				<div
					className={styles.result}
					style={{
						fontSize:
							props.diceTypography?.result.fontSize ||
							DEFAULT_PORTRAIT_CONFIG.typography.dice.result.fontSize,
						fontStyle: props.diceTypography?.result.italic ? 'italic' : undefined,
						textShadow: `0 0 10px #${props.color}, 0 0 30px #${props.color}, 0 0 50px #${props.color}`,
					}}>
					{diceResult.roll}
				</div>
			</Fade>
			<Fade
				in={diceResult.show && Boolean(diceResult.description)}
				style={{ transitionDelay: diceResult.show ? '500ms' : undefined }}>
				<div
					className={styles.description}
					style={{
						fontSize:
							props.diceTypography?.description.fontSize ||
							DEFAULT_PORTRAIT_CONFIG.typography.dice.description.fontSize,
						fontStyle: props.diceTypography?.description.italic ? 'italic' : undefined,
						textShadow: `0 0 10px #${props.color}, 0 0 30px #${props.color}, 0 0 50px #${props.color}`,
					}}>
					{diceResult.description}
				</div>
			</Fade>
		</div>
	);
};

export default PortraitDiceContainer;
