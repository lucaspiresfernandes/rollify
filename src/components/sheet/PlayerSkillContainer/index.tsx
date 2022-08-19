import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { ApiContext, DiceRollContext, LoggerContext } from '../../../contexts';
import useExtendedState from '../../../hooks/useExtendedState';
import type { Locale } from '../../../i18n';
import type { PlayerSkillApiResponse } from '../../../pages/api/sheet/player/skill';
import { handleDefaultApiResponse } from '../../../utils';
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
		favourite: boolean;
	}[];
	enableModifiers: boolean;
};

const PlayerSkillContainer: React.FC<PlayerSkillContainerProps> = (props) => {
	const [playerSkills, setPlayerSkills] = useState(props.playerSkills);
	const { t } = useI18n<Locale>();

	const baseSkills = playerSkills
		.filter((skill) => !skill.favourite)
		.sort((a, b) => a.name.localeCompare(b.name));

	const favouriteSkills = playerSkills
		.filter((skill) => skill.favourite)
		.sort((a, b) => a.name.localeCompare(b.name));

	const onSetFavourite = (
		skill: { id: number; checked: boolean; value: number; modifier: number },
		favourite: boolean
	) => {
		setPlayerSkills((playerSkills) =>
			playerSkills.map((sk) => {
				if (sk.id === skill.id) {
					return {
						...sk,
						checked: skill.checked,
						value: skill.value,
						modifier: skill.modifier,
						favourite,
					};
				}
				return sk;
			})
		);
	};

	return (
		<>
			<Grid item xs={12} sm={6}>
				<FavouriteSkillsContainer
					title={`${props.title} (${t('quickAccess')})`}
					playerSkills={favouriteSkills.map((skills) => ({
						...skills,
						modifier: props.enableModifiers ? skills.modifier : null,
					}))}
					onSkillUnfavourite={(skill) => onSetFavourite(skill, false)}
				/>
			</Grid>

			<Grid item xs={12}>
				<BaseSkillsContainer
					title={props.title}
					playerSkills={baseSkills.map((skills) => ({
						...skills,
						modifier: props.enableModifiers ? skills.modifier : null,
					}))}
					onSkillFavourite={(skill) => onSetFavourite(skill, true)}
				/>
			</Grid>
		</>
	);
};

export type PlayerSkillFieldProps = {
	id: number;
	name: string;
	value: number;
	modifier: number | null;
	checked: boolean;
	notifyClearChecked: boolean;
	onFavourite?: (skill: { id: number; checked: boolean; value: number; modifier: number }) => void;
	onUnfavourite?: (skill: {
		id: number;
		checked: boolean;
		value: number;
		modifier: number;
	}) => void;
};

const UnderlyingPlayerSkillField: React.FC<PlayerSkillFieldProps> = (props) => {
	const [value, setValue, isValueClean] = useExtendedState(props.value.toString());
	const [checked, setChecked] = useState(props.checked);
	const [modifier, setModifier, isModifierClean] = useExtendedState(() => {
		if (!props.modifier) return null;
		const modifier = props.modifier;
		let mod = modifier.toString();
		if (modifier >= 0) mod = `+${mod}`;
		return mod;
	});
	const componentDidMount = useRef(false);

	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const rollDice = useContext(DiceRollContext);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (!componentDidMount.current) {
			componentDidMount.current = true;
			return;
		}
		if (checked) setChecked(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.notifyClearChecked]);

	const handleDiceRoll: React.MouseEventHandler<HTMLDivElement> = (ev) => {
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

	const onCheckChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const chk = ev.target.checked;
		setChecked(chk);
		api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id: props.id, checked: chk })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
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
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
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
						.then((res) => handleDefaultApiResponse(res, log, t))
						.catch(() => log({ severity: 'error', text: t('error.unknown') }));
			  }
			: undefined;

	return (
		<>
			<div>
				<Checkbox
					inputProps={{ 'aria-label': 'Marker' }}
					checked={checked}
					onChange={onCheckChange}
					sx={{ padding: 0 }}
				/>
				{props.onFavourite && (
					<IconButton
						onClick={() =>
							props.onFavourite?.({
								id: props.id,
								checked,
								value: parseInt(value),
								modifier: parseInt(modifier as string) || 0,
							})
						}
						sx={{ padding: 0, ml: 2 }}
						title={t('star')}>
						<BookmarkAddIcon />
					</IconButton>
				)}
				{props.onUnfavourite && (
					<IconButton
						onClick={() =>
							props.onUnfavourite?.({
								id: props.id,
								checked,
								value: parseInt(value),
								modifier: parseInt(modifier as string) || 0,
							})
						}
						sx={{ padding: 0, ml: 2 }}
						title={t('unstar')}>
						<BookmarkRemoveIcon />
					</IconButton>
				)}
			</div>
			<Box
				flexGrow={1}
				display='flex'
				justifyContent='center'
				alignItems='center'
				className='clickable decoration'
				onClick={handleDiceRoll}>
				<Typography component='h3' variant='subtitle1'>
					{props.name}
				</Typography>
			</Box>
			{modifier !== null && (
				<div>
					<TextField
						variant='standard'
						margin='dense'
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
					id={`skill${props.id}`}
					autoComplete='off'
					value={value}
					onChange={(ev) => setValue(ev.target.value)}
					onBlur={onValueBlur}
					inputProps={{
						style: { textAlign: 'center' },
						'aria-label': props.name,
					}}
					style={{ width: '5rem' }}
				/>
			</div>
		</>
	);
};

export const PlayerSkillField = memo(UnderlyingPlayerSkillField);

export default PlayerSkillContainer;
