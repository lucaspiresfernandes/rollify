import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useContext } from 'react';
import dice20 from '../../../public/dice20.webp';
import SheetContainer from './Section';
import { ApiContext, DiceRollContext, LoggerContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import { handleDefaultApiResponse } from '../../utils';
import type { DiceConfig } from '../../utils/dice';

type PlayerCharacteristicContainerProps = {
	title: string;
	playerCharacteristics: {
		id: number;
		name: string;
		value: number;
		modifier: number;
	}[];
	characteristicDiceConfig: DiceConfig['characteristic'];
};

const PlayerCharacteristicContainer: React.FC<PlayerCharacteristicContainerProps> = (props) => {
	return (
		<SheetContainer title={props.title}>
			<Grid container justifyContent='center' textAlign='center'>
				{props.playerCharacteristics.map((char) => (
					<Grid item key={char.id} md={4} xs={6}>
						<PlayerCharacteristicField
							{...char}
							modifier={props.characteristicDiceConfig.enable_modifiers ? char.modifier : null}
							characteristicDiceConfig={props.characteristicDiceConfig}
						/>
					</Grid>
				))}
			</Grid>
		</SheetContainer>
	);
};

type PlayerCharacteristicFieldProps = {
	id: number;
	name: string;
	value: number;
	modifier: number | null;
	characteristicDiceConfig: DiceConfig['characteristic'];
};

const PlayerCharacteristicField: React.FC<PlayerCharacteristicFieldProps> = (props) => {
	const [value, setValue, isValueClean] = useExtendedState(props.value.toString());
	const [modifier, setModifier, isModifierClean] = useExtendedState(() => {
		const mod = props.modifier;
		if (mod === null) return null;
		let aux = mod.toString();
		if (mod > -1) aux = `+${aux}`;
		return aux;
	});
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const rollDice = useContext(DiceRollContext);

	const handleDiceClick = (standalone: boolean) => {
		const roll = props.characteristicDiceConfig.value;
		const branched = props.characteristicDiceConfig.branched;

		let mod = 0;
		if (modifier) mod = parseInt(modifier);

		const val = parseInt(value);

		rollDice(
			{ num: standalone ? 1 : undefined, roll, ref: Math.max(0, val + mod), branched },
			(results) => {
				if (!mod) return;
				return results.map((res) => ({
					roll: Math.max(1, res.roll + mod),
					resultType: res.resultType,
				}));
			}
		);
	};

	const onValueBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		const aux = value;
		let newValue = parseInt(aux);
		if (aux.length === 0 || isNaN(newValue)) newValue = 0;
		setValue(newValue.toString());

		if (isValueClean()) return;

		api
			.post('/sheet/player/characteristic', {
				id: props.id,
				value: newValue,
			})
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: err.message }));
	};

	const onModifierBlur =
		modifier !== null
			? () => {
					const num = parseInt(modifier);

					let newModifier = modifier;
					if (isNaN(num)) newModifier = '+0';
					else if (newModifier === '-0') newModifier = '+0';
					else if (num >= 0) newModifier = `+${num}`;

					if (modifier !== newModifier) setModifier(newModifier);

					if (isModifierClean()) return;

					api
						.post('/sheet/player/characteristic', {
							id: props.id,
							modifier: parseInt(newModifier),
						})
						.then((res) => handleDefaultApiResponse(res, log))
						.catch((err) => log({ severity: 'error', text: err.message }));
			  }
			: undefined;

	return (
		<Box display='flex' flexDirection='column' justifyContent='center' textAlign='center' my={2}>
			<div>
				<Image
					src={dice20}
					alt='Dice'
					onClick={(ev) => handleDiceClick(ev.ctrlKey)}
					width={45}
					height={45}
					style={{ cursor: 'pointer' }}
				/>
			</div>
			<div>
				<Typography variant='body1' component='label' htmlFor={`characteristic${props.id}`}>
					{props.name}
				</Typography>
			</div>
			{modifier !== null && (
				<div>
					<TextField
						variant='standard'
						size='small'
						autoComplete='off'
						value={modifier}
						onChange={(ev) => setModifier(ev.target.value)}
						onBlur={onModifierBlur}
						inputProps={{
							style: { textAlign: 'center' },
							'aria-label': `Modifier for ${props.name}`,
						}}
						style={{ width: '3rem' }}
					/>
				</div>
			)}
			<div>
				<TextField
					variant='standard'
					margin='dense'
					id={`characteristic${props.id}`}
					autoComplete='off'
					value={value}
					onChange={(ev) => setValue(ev.target.value)}
					onBlur={onValueBlur}
					inputProps={{
						style: { textAlign: 'center' },
					}}
					style={{ width: '5rem' }}
				/>
			</div>
		</Box>
	);
};

export default PlayerCharacteristicContainer;
