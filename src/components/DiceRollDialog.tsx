import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ApiContext, LoggerContext } from '../contexts';
import type { Locale } from '../i18n';
import type { DiceApiResponse } from '../pages/api/dice';
import type { DiceRequest, DiceResponse } from '../utils/dice';

export type DiceRoll = {
	dice: DiceRequest | null;
	onResult?: (result: DiceResponse[]) => void | DiceResponse[];
};

type DiceRollDialogProps = DiceRoll & {
	onClose: () => void;
};

type DisplayDice = {
	roll: number | string;
	description?: number | string;
};

const DiceRollDialog: React.FC<DiceRollDialogProps> = (props) => {
	const [diceRequest, setDiceRequest] = useState<DiceRoll>({ dice: null });
	const [diceResponse, setDiceResponse] = useState<DiceResponse[] | null>(null);
	const [num, setNum] = useState(1);

	const [descriptionFade, setDescriptionFade] = useState(false);
	const descriptionDelayTimeout = useRef<NodeJS.Timeout | null>(null);

	const { t } = useI18n<Locale>();
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	const result: DisplayDice | undefined = useMemo(() => {
		if (!diceResponse) return;

		if (diceResponse.length === 1) {
			return {
				roll: diceResponse[0].roll,
				description: diceResponse[0].resultType?.description,
			};
		}

		if (diceResponse.length > 1) {
			if (Array.isArray(props.dice)) {
				const dices = diceResponse.map((d) => d.roll);
				const sum = dices.reduce((a, b) => a + b, 0);
				return {
					roll: sum,
					description: dices.join(' + '),
				};
			} else {
				type _Result = { description?: string; weight: number };
				let max: _Result = { weight: Number.MIN_SAFE_INTEGER };
				let min: _Result = { weight: Number.MAX_SAFE_INTEGER };

				for (const result of diceResponse) {
					if (result.resultType) {
						if (result.resultType.successWeight > max.weight)
							max = {
								description: result.resultType.description,
								weight: result.resultType.successWeight,
							};

						if (result.resultType.successWeight < min.weight)
							min = {
								description: result.resultType.description,
								weight: result.resultType.successWeight,
							};
					}
				}

				const roll = diceResponse.map((d) => d.roll).join(' | ');
				let description: string | undefined;

				if (min.description && max.description) {
					if (min.description === max.description) description = min.description;
					else description = `${min.description} - ${max.description}`;
				} else description = min.description || max.description;

				return { roll, description };
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [diceResponse]);

	useEffect(() => {
		if (props.dice === null) return;
		setDiceResponse(null);
		if (Array.isArray(props.dice)) return roll({ dice: props.dice, onResult: props.onResult });
		if (props.dice.num) {
			setNum(props.dice.num);
			return roll({ dice: props.dice, onResult: props.onResult });
		}
		setDiceRequest({ dice: null });
		setNum(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.dice]);

	useEffect(() => {
		if (diceResponse && (diceResponse.length > 1 || diceResponse[0].resultType))
			descriptionDelayTimeout.current = setTimeout(() => setDescriptionFade(true), 500);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [diceResponse]);

	const roll = (diceRoll: DiceRoll) => {
		setDescriptionFade(false);
		setDiceRequest(diceRoll);
		api
			.post<DiceApiResponse>('/dice', { dices: diceRoll.dice })
			.then(({ data }) => {
				if (data.status === 'success') {
					let results = data.results;
					if (props.onResult) {
						let newResults = props.onResult(results);
						if (newResults) results = newResults;
					}
					return setDiceResponse(results);
				}

				closeDialog();
				switch (data.reason) {
					case 'invalid_dices':
						return log({ severity: 'error', text: 'Invalid Dices' });
					default:
						return log({ severity: 'error', text: 'Unknown error: ' + data.reason });
				}
			})
			.catch((err) => {
				closeDialog();
				log({ severity: 'error', text: t('error.unknown') });
			});
	};

	const onRollClick: React.MouseEventHandler<HTMLButtonElement> = () => {
		const dice = props.dice;
		if (dice === null) return;
		if (!Array.isArray(dice)) dice.num = num;
		roll({ dice, onResult: props.onResult });
	};

	const onRollAgainClick: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
		setDiceResponse(null);
		onRollClick(ev);
	};

	const closeDialog = () => {
		if (descriptionDelayTimeout.current) {
			clearTimeout(descriptionDelayTimeout.current);
			descriptionDelayTimeout.current = null;
		}
		props.onClose();
	};

	const loading = diceRequest.dice !== null && diceResponse === null;

	return (
		<Dialog open={props.dice !== null} onClose={closeDialog} maxWidth='xs' fullWidth>
			<DialogTitle>{t('modal.title.rollDice')}</DialogTitle>
			<DialogContent sx={{ textAlign: 'center', mt: 2 }}>
				<Box display='flex' flexDirection='column' justifyContent='center' height={110}>
					{diceRequest.dice ? (
						result ? (
							<div>
								<Fade in appear>
									<Typography variant='h4' component='h2' gutterBottom>
										{result.roll}
									</Typography>
								</Fade>
								<Fade in={descriptionFade}>
									<Typography variant='body1'>{result.description}</Typography>
								</Fade>
							</div>
						) : (
							<div>
								<CircularProgress disableShrink />
							</div>
						)
					) : (
						<div>
							<Typography variant='h6' component='h2'>
								{t('modal.label.numberOfDices')}
							</Typography>
							<Box
								display='flex'
								flexDirection='row'
								alignItems='center'
								justifyContent='center'
								gap={3}
								my={2}>
								<Button variant='contained' onClick={() => setNum((n) => Math.max(1, n - 1))}>
									-
								</Button>
								<Typography variant='h4' component='h2'>
									{num}
								</Typography>
								<Button variant='contained' onClick={() => setNum((n) => Math.max(1, n + 1))}>
									+
								</Button>
							</Box>
						</div>
					)}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeDialog}>
					{diceRequest.dice ? t('modal.close') : t('modal.cancel')}
				</Button>
				{diceRequest.dice ? (
					<Button onClick={onRollAgainClick} disabled={loading}>
						{t('modal.rollAgain')}
					</Button>
				) : (
					<Button onClick={onRollClick}>{t('modal.roll')}</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default DiceRollDialog;
