import AddIcon from '@mui/icons-material/AddCircleOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AxiosInstance } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import SheetContainer from './Section';
import {
	AddDataContext,
	ApiContext,
	DiceRollContext,
	DiceRollEvent,
	LoggerContext,
	LoggerContextType,
} from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { PlayerSkillApiResponse } from '../../pages/api/sheet/player/skill';
import type { PlayerSkillClearChecksApiResponse } from '../../pages/api/sheet/player/skill/clearchecks';
import type { SkillSheetApiResponse } from '../../pages/api/sheet/skill';
import { handleDefaultApiResponse } from '../../utils';
import type { DiceConfig } from '../../utils/dice';
import PartialBackdrop from '../PartialBackdrop';

type PlayerSkillContainerProps = {
	title: string;
	playerSkills: {
		id: number;
		name: string;
		value: number;
		modifier: number;
		checked: boolean;
		specializationName: string | null;
	}[];
	skillDiceConfig: DiceConfig['skill'];
	automaticMarking: boolean;
};

const PlayerSkillContainer: React.FC<PlayerSkillContainerProps> = (props) => {
	const [playerSkills, setPlayerSkills] = useState(props.playerSkills);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [notify, setNotify] = useState(false);

	const { t } = useI18n<Locale>();
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const rollDice = useContext(DiceRollContext);
	const addDataDialog = useContext(AddDataContext);

	const onAddSkill = (id: number) => {
		addDataDialog.closeDialog();
		setLoading(true);
		api
			.put<PlayerSkillApiResponse>('/sheet/player/skill', { id })
			.then((res) => {
				if (res.data.status === 'success') {
					const skill = res.data.skill;
					return setPlayerSkills([
						...playerSkills,
						{
							...skill,
							...skill.Skill,
							specializationName: skill.Skill.Specialization?.name || null,
						},
					]);
				}
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const loadAvailableSkills = () => {
		setLoading(true);
		api
			.get<SkillSheetApiResponse>('/sheet/skill')
			.then((res) => {
				if (res.data.status === 'success') {
					const skills = res.data.skill.map((sk) => ({
						id: sk.id,
						name: sk.Specialization?.name ? `${sk.Specialization.name} (${sk.name})` : sk.name,
					}));
					addDataDialog.openDialog(skills, onAddSkill);
					return;
				}
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const clearChecks = () => {
		setLoading(true);
		api
			.post<PlayerSkillClearChecksApiResponse>('/sheet/player/skill/clearchecks')
			.then((res) => {
				if (res.data.status === 'success') return setNotify((n) => !n);
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const playerSkillsList = useMemo(
		() =>
			playerSkills
				.map((skill) => {
					let name = skill.name;
					if (skill.specializationName) name = `${skill.specializationName} (${name})`;
					return {
						name,
						id: skill.id,
						value: skill.value,
						checked: skill.checked,
						modifier: skill.modifier,
					};
				})
				.sort((a, b) => a.name.localeCompare(b.name)),
		[playerSkills]
	);

	return (
		<SheetContainer
			title={props.title}
			sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
			sideButton={
				<IconButton aria-label='Add Skill' onClick={loadAvailableSkills}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<Box display='flex' alignItems='center' gap={1} my={1}>
				<Paper sx={{ p: 0.5, flex: '1 0' }}>
					<InputBase
						fullWidth
						placeholder={t('search')}
						inputProps={{ 'aria-label': t('search') }}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						endAdornment={
							search ? (
								<IconButton size='small' onClick={() => setSearch('')}>
									<ClearIcon />
								</IconButton>
							) : undefined
						}
					/>
				</Paper>
				<div>
					<Button size='small' variant='outlined' onClick={clearChecks}>
						{t('sheet.clearMarkers')}
					</Button>
				</div>
			</Box>
			<Divider sx={{ mb: 2 }} />
			<Box
				position='relative'
				flex={{ sm: '1 0' }}
				height={{ xs: 350 }}
				sx={{ overflowY: 'auto' }}>
				<Grid
					container
					justifyContent='center'
					alignItems='end'
					position='absolute'
					top={0}
					left={0}
					style={{ overflowWrap: 'break-word' }}>
					{playerSkillsList.map((skill) => {
						return (
							<Grid
								item
								key={skill.id}
								lg={search.length > 2 ? undefined : 3}
								md={4}
								xs={6}
								display={
									skill.name.toLowerCase().includes(search.toLowerCase()) ? undefined : 'none'
								}>
								<PlayerSkillField
									{...skill}
									skillDiceConfig={props.skillDiceConfig}
									automaticMarking={props.automaticMarking}
									notifyClearChecked={notify}
									log={log}
									api={api}
									rollDice={rollDice}
								/>
							</Grid>
						);
					})}
				</Grid>
			</Box>
		</SheetContainer>
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
	log: LoggerContextType;
	api: AxiosInstance;
	rollDice: DiceRollEvent;
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

		props.rollDice(
			{ num: standalone ? 1 : undefined, roll, ref: Math.max(0, val + mod), branched },
			(results) => {
				const result = results[0];
				if (props.automaticMarking && (result.resultType?.successWeight || -1) >= 0) {
					setChecked(true);
					props.api
						.post('/sheet/player/skill', {
							id: props.id,
							checked: true,
						})
						.then((res) => handleDefaultApiResponse(res, props.log))
						.catch((err) => props.log({ severity: 'error', text: err.message }));
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
		props.api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id: props.id, checked: chk })
			.then((res) => handleDefaultApiResponse(res, props.log))
			.catch((err) => props.log({ severity: 'error', text: err.message }));
	};

	const onValueBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		const aux = value;
		let newValue = parseInt(aux);
		if (aux.length === 0 || isNaN(newValue)) {
			newValue = 0;
			setValue(newValue.toString());
		}

		if (isValueClean()) return;

		props.api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id: props.id, value: newValue })
			.then((res) => handleDefaultApiResponse(res, props.log))
			.catch((err) => props.log({ severity: 'error', text: err.message }));
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

					props.api
						.post<PlayerSkillApiResponse>('/sheet/player/skill', {
							id: props.id,
							modifier: parseInt(newModifier),
						})
						.then((res) => handleDefaultApiResponse(res, props.log))
						.catch((err) => props.log({ severity: 'error', text: err.message }));
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
			</div>
			<Box
				sx={{
					':hover': {
						cursor: 'pointer',
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

export default PlayerSkillContainer;