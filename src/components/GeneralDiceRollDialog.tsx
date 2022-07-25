import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import { useState } from 'react';
import dice10 from '../../public/dice10.webp';
import dice12 from '../../public/dice12.webp';
import dice20 from '../../public/dice20.webp';
import dice4 from '../../public/dice4.webp';
import dice6 from '../../public/dice6.webp';
import dice8 from '../../public/dice8.webp';
import type { Locale } from '../i18n';
import type { ResolvedDice } from '../utils/dice';

export const DEFAULT_ROLL: ResolvedDice[] = [{ num: 1, roll: 20 }];

export type GeneralDiceRollDialogSubmitHandler = (req: ResolvedDice[]) => void;

type GeneralDiceRollDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: GeneralDiceRollDialogSubmitHandler;
	children?: React.ReactNode;
};

const GeneralDiceRollDialog: React.FC<GeneralDiceRollDialogProps> = (props) => {
	const [dices, setDices] = useState([
		{
			num: 0,
			roll: 4,
			img: dice4,
		},
		{
			num: 0,
			roll: 6,
			img: dice6,
		},
		{
			num: 0,
			roll: 8,
			img: dice8,
		},
		{
			num: 0,
			roll: 10,
			img: dice10,
		},
		{
			num: 0,
			roll: 12,
			img: dice12,
		},
		{
			num: 0,
			roll: 20,
			img: dice20,
		},
	]);
	const { t } = useI18n<Locale>();

	const updateDice = (roll: number, coeff: number) => {
		setDices((d) =>
			d.map((dice) => {
				if (dice.roll === roll) return { ...dice, num: Math.max(dice.num + coeff, 0) };
				return dice;
			})
		);
	};

	const onRollClick: React.MouseEventHandler<HTMLButtonElement> = () => {
		const diceRequest: ResolvedDice[] = [];
		for (const dice of dices) {
			const num = dice.num;
			for (let i = 0; i < num; i++) {
				diceRequest.push({ num: 1, roll: dice.roll });
			}
		}
		props.onSubmit(diceRequest);
	};

	return (
		<>
			{props.children}
			<Dialog
				open={props.open}
				onClose={props.onClose}
				TransitionProps={{
					onExited: () => setDices((dices) => dices.map((d) => ({ ...d, num: 0 }))),
				}}>
				<DialogTitle>TODO: Rolagem Geral de Dados</DialogTitle>
				<DialogContent>
					<Grid container spacing={4}>
						{dices.map((dice) => (
							<Grid item key={dice.roll} sm={4} xs={6} textAlign='center'>
								<div style={{ maxWidth: 100 }}>
									<Image
										src={dice.img}
										alt={`${dice.num || ''}D${dice.roll}`}
										title={`${dice.num || ''}D${dice.roll}`}
										layout='responsive'
									/>
								</div>
								<Box mt={1} display='flex' alignItems='center'>
									<Button
										variant='contained'
										size='small'
										onClick={() => updateDice(dice.roll, -1)}>
										-
									</Button>
									<Typography variant='body1' flex='1'>
										{dice.num}
									</Typography>
									<Button variant='contained' size='small' onClick={() => updateDice(dice.roll, 1)}>
										+
									</Button>
								</Box>
							</Grid>
						))}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
					<Button onClick={onRollClick}>{t('modal.roll')}</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default GeneralDiceRollDialog;
