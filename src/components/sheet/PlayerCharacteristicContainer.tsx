import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useContext } from 'react';
import { ApiContext, DiceRollContext, LoggerContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import { handleDefaultApiResponse } from '../../utils';
import SheetContainer from './Section';

type PlayerCharacteristicContainerProps = {
	title: string;
	playerCharacteristics: {
		id: number;
		name: string;
		value: number;
		modifier: number;
	}[];
	enableModifiers: boolean;
};

const PlayerCharacteristicContainer: React.FC<PlayerCharacteristicContainerProps> = (props) => {
	return (
		<SheetContainer title={props.title}>
			<Grid container justifyContent='center' textAlign='center'>
				{props.playerCharacteristics.map((char) => (
					<Grid item key={char.id} md={4} xs={6}>
						<PlayerCharacteristicField
							{...char}
							modifier={props.enableModifiers ? char.modifier : null}
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
	const { t } = useI18n<Locale>();
	const rollDice = useContext(DiceRollContext);

	const handleDiceClick: React.MouseEventHandler<HTMLLabelElement> = (ev) => {
		let mod = 0;
		if (modifier) mod = parseInt(modifier);

		const val = parseInt(value);
		const standalone = ev.ctrlKey;

		rollDice(
			{ num: standalone ? 1 : undefined, ref: Math.max(0, val + mod) },
			mod
				? (results) => {
						return results.map((res) => ({
							roll: Math.max(1, res.roll + mod),
							description: res.description,
						}));
				  }
				: undefined
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
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const onModifierBlur =
		modifier === null
			? undefined
			: () => {
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
						.then((res) => handleDefaultApiResponse(res, log, t))
						.catch(() => log({ severity: 'error', text: t('error.unknown') }));
			  };

	return (
		<Box display='flex' flexDirection='column' justifyContent='center' textAlign='center' my={2}>
			<div>
				<Typography
					variant='body1'
					component='label'
					htmlFor={`characteristic${props.id}`}
					sx={{
						cursor: 'pointer',
						':hover': {
							textDecoration: 'underline',
						},
					}}
					onClick={handleDiceClick}>
					{props.name}
				</Typography>
			</div>
			{modifier !== null && (
				<div>
					<TextField
						variant='standard'
						margin='dense'
						size='small'
						name={`diceUtilMod${props.name.substring(0, 3).toUpperCase()}`}
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
					id={`characteristic${props.id}`}
					name={`diceUtil${props.name.substring(0, 3).toUpperCase()}`}
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
