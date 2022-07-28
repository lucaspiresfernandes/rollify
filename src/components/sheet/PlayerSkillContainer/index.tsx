import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ApiContext, DiceRollContext, LoggerContext } from '../../../contexts';
import useExtendedState from '../../../hooks/useExtendedState';
import type { PlayerSkillApiResponse } from '../../../pages/api/sheet/player/skill';
import { handleDefaultApiResponse } from '../../../utils';
import type { DiceConfig } from '../../../utils/dice';
import BaseSkillsContainer from './BaseSkillsContainer';
import FavouriteSkillsContainer from './FavouriteSkillsContainer';

export type PlayerSkillContainerProps = {
	title: string;
	playerSkills: {
		id: number;
		name: string;
		value: number;
		modifier: number;
		checked: boolean;
		specializationName: string | null;
		favourite: boolean;
	}[];
	skillDiceConfig: DiceConfig['skill'];
	automaticMarking: boolean;
};

const PlayerSkillContainer: React.FC<PlayerSkillContainerProps> = (props) => {
	const [playerSkills, setPlayerSkills] = useState(props.playerSkills);

	const baseSkills = useMemo(
		() =>
			playerSkills
				.filter((skill) => !skill.favourite)
				.map((skill) => {
					let name = skill.name;
					if (skill.specializationName) name = `${skill.specializationName} (${name})`;
					return {
						id: skill.id,
						name,
						modifier: skill.modifier,
						value: skill.value,
						checked: skill.checked,
					};
				})
				.sort((a, b) => a.name.localeCompare(b.name)),
		[playerSkills]
	);

	const favouriteSkills = useMemo(
		() =>
			playerSkills
				.filter((skill) => skill.favourite)
				.map((skill) => {
					let name = skill.name;
					if (skill.specializationName) name = `${skill.specializationName} (${name})`;
					return {
						id: skill.id,
						name,
						modifier: skill.modifier,
						value: skill.value,
						checked: skill.checked,
					};
				}),
		[playerSkills]
	);

	const onSetFavourite = (id: number, favourite: boolean) => {
		setPlayerSkills((sk) =>
			sk.map((skill) => {
				if (skill.id === id) {
					return {
						...skill,
						favourite,
					};
				}
				return skill;
			})
		);
	};

	return (
		<>
			<Grid item xs={12} sm={6}>
				<FavouriteSkillsContainer
					title={props.title}
					playerSkills={favouriteSkills}
					automaticMarking={props.automaticMarking}
					skillDiceConfig={props.skillDiceConfig}
					onSkillUnfavourite={(id) => onSetFavourite(id, false)}
				/>
			</Grid>

			<Grid item xs={12}>
				<BaseSkillsContainer
					title={props.title}
					playerSkills={baseSkills}
					automaticMarking={props.automaticMarking}
					skillDiceConfig={props.skillDiceConfig}
					onSkillFavourite={(id) => onSetFavourite(id, true)}
				/>
			</Grid>
		</>
	);
};

type PlayerSkillFieldProps = {
	id: number;
	name: string;
	value: number;
	modifier: number;
	checked: boolean;
	skillDiceConfig: DiceConfig['skill'];
	automaticMarking: boolean;
	notifyClearChecked: boolean;
	onDelete?: () => void;
};

const PlayerSkillField: React.FC<PlayerSkillFieldProps> = (props) => {
	const [value, setValue, isValueClean] = useExtendedState(props.value.toString());
	const [checked, setChecked] = useState(props.checked);
	const [modifier, setModifier, isModifierClean] = useExtendedState(() => {
		if (!props.skillDiceConfig.enable_modifiers) return null;
		const modifier = props.modifier;
		let mod = modifier.toString();
		if (modifier > -1) mod = `+${mod}`;
		return mod;
	});
	const componentDidMount = useRef(false);

	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const rollDice = useContext(DiceRollContext);

	useEffect(() => {
		if (!componentDidMount.current) {
			componentDidMount.current = true;
			return;
		}
		if (checked) setChecked(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.notifyClearChecked]);

	const handleDiceRoll: React.MouseEventHandler<HTMLDivElement> = (ev) => {
		const roll = props.skillDiceConfig.value;
		const branched = props.skillDiceConfig.branched;

		let mod = 0;
		if (modifier) mod = parseInt(modifier);

		const val = parseInt(value);
		const standalone = ev.ctrlKey;

		rollDice(
			{ num: standalone ? 1 : undefined, roll, ref: Math.max(0, val + mod), branched },
			(results) => {
				const result = results[0];
				if (props.automaticMarking && (result.resultType?.successWeight || -1) >= 0) {
					setChecked(true);
					api
						.post('/sheet/player/skill', {
							id: props.id,
							checked: true,
						})
						.then((res) => handleDefaultApiResponse(res, log))
						.catch((err) => log({ severity: 'error', text: err.message }));
				}

				if (!mod) return;
				return results.map((res) => ({
					roll: Math.max(1, res.roll + mod),
					resultType: res.resultType,
				}));
			}
		);
	};

	const onCheckChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const chk = ev.target.checked;
		setChecked(chk);
		api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id: props.id, checked: chk })
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: err.message }));
	};

	const onValueBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		const aux = value;
		let newValue = parseInt(aux);
		if (aux.length === 0 || isNaN(newValue)) {
			newValue = 0;
			setValue(newValue.toString());
		}

		if (isValueClean()) return;

		api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id: props.id, value: newValue })
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
						.post<PlayerSkillApiResponse>('/sheet/player/skill', {
							id: props.id,
							modifier: parseInt(newModifier),
						})
						.then((res) => handleDefaultApiResponse(res, log))
						.catch((err) => log({ severity: 'error', text: err.message }));
			  }
			: undefined;

	return (
		<Box display='flex' flexDirection='column' justifyContent='center' textAlign='center' m={2}>
			<div>
				<Checkbox
					inputProps={{ 'aria-label': 'Marker' }}
					checked={checked}
					onChange={onCheckChange}
				/>
				{props.onDelete && (
					<Tooltip title='TODO: Unstar' describeChild>
						<IconButton size='small' onClick={props.onDelete}>
							<ClearIcon />
						</IconButton>
					</Tooltip>
				)}
			</div>
			<Box
				sx={{
					cursor: 'pointer',
					':hover': {
						textDecoration: 'underline',
					},
				}}
				onClick={handleDiceRoll}>
				<Typography
					variant='subtitle1'
					component='label'
					htmlFor={`skill${props.id}`}
					style={{ cursor: 'pointer' }}>
					{props.name}
				</Typography>
			</Box>
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
					id={`skill${props.id}`}
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

export const MemoPlayerSkillField = memo(PlayerSkillField, (prev, next) => {
	return (
		prev.notifyClearChecked === next.notifyClearChecked &&
		Object.is(prev.skillDiceConfig, next.skillDiceConfig) &&
		prev.id === next.id &&
		prev.name === next.name
	);
});

export default PlayerSkillContainer;
