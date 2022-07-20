import AddIcon from '@mui/icons-material/AddCircleOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import SheetContainer from '../../components/sheet/Container';
import { ApiContext, LoggerContext, SocketContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { PlayerSkillApiResponse } from '../../pages/api/sheet/player/skill';
import type { PlayerSkillClearChecksApiResponse } from '../../pages/api/sheet/player/skill/clearchecks';
import { handleDefaultApiResponse } from '../../utils';
import type { DiceConfig } from '../../utils/dice';
import type { SkillAddEvent, SkillChangeEvent, SkillRemoveEvent } from '../../utils/socket';

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
	availableSkills: {
		id: number;
		name: string;
		specializationName: string | null;
	}[];
	skillDiceConfig: DiceConfig['skill'];
};

const PlayerSkillContainer: React.FC<PlayerSkillContainerProps> = (props) => {
	const [availableSkills, setAvailableSkills] = useState(props.availableSkills);
	const [playerSkills, setPlayerSkills] = useState(props.playerSkills);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [notify, setNotify] = useState(false);

	const socket = useContext(SocketContext);
	const { t } = useI18n<Locale>();
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	const socket_skillAdd = useRef<SkillAddEvent>(() => {});
	const socket_skillRemove = useRef<SkillRemoveEvent>(() => {});
	const socket_skillChange = useRef<SkillChangeEvent>(() => {});

	useEffect(() => {
		socket_skillAdd.current = (id, name, specializationName) => {
			if (availableSkills.findIndex((sk) => sk.id === id) > -1) return;
			setAvailableSkills((skills) => [
				...skills,
				{
					id,
					name,
					specializationName,
				},
			]);
		};

		socket_skillRemove.current = (id) => {
			const availableSkillIndex = availableSkills.findIndex((skill) => skill.id === id);
			if (availableSkillIndex > -1) {
				setAvailableSkills((availableSkills) => {
					const newSkills = [...availableSkills];
					newSkills.splice(availableSkillIndex, 1);
					return newSkills;
				});
				return;
			}

			const playerSkillIndex = playerSkills.findIndex((skill) => skill.id === id);
			if (playerSkillIndex === -1) return;

			setPlayerSkills((skills) => {
				const newSkills = [...skills];
				newSkills.splice(playerSkillIndex, 1);
				return newSkills;
			});
		};

		socket_skillChange.current = (id, name, specializationName) => {
			const availableSkillIndex = availableSkills.findIndex((skill) => skill.id === id);

			if (availableSkillIndex > -1) {
				setAvailableSkills((skills) => {
					const newSkills = [...skills];
					newSkills[availableSkillIndex] = {
						id,
						name,
						specializationName,
					};
					return newSkills;
				});
				return;
			}

			const playerSkillIndex = playerSkills.findIndex((skill) => skill.id === id);
			if (playerSkillIndex === -1) return;

			setPlayerSkills((skills) => {
				const newSkills = [...skills];
				newSkills[playerSkillIndex] = {
					...newSkills[playerSkillIndex],
					name,
					specializationName,
				};
				return newSkills;
			});
		};
	});

	useEffect(() => {
		socket.on('skillAdd', (id, name, specializationName) =>
			socket_skillAdd.current(id, name, specializationName)
		);
		socket.on('skillRemove', (id) => socket_skillRemove.current(id));
		socket.on('skillChange', (id, name, specializationName) =>
			socket_skillChange.current(id, name, specializationName)
		);
		return () => {
			socket.off('skillAdd');
			socket.off('skillRemove');
			socket.off('skillChange');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onAddSkill = (id: number) => {
		setLoading(true);
		api
			.put<PlayerSkillApiResponse>('/sheet/player/skill', { id })
			.then((res) => {
				if (res.data.status === 'success') {
					const skill = res.data.skill;
					setPlayerSkills([
						...playerSkills,
						{
							...skill,
							...skill.Skill,
							specializationName: skill.Skill.Specialization?.name || null,
						},
					]);

					const newSkills = [...availableSkills];
					newSkills.splice(
						newSkills.findIndex((sk) => sk.id === id),
						1
					);
					setAvailableSkills(newSkills);
					return;
				}
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => {
				// setAddSkillShow(false);
				setLoading(false);
			});
	};

	const clearChecks = () => {
		setLoading(true);
		api
			.post<PlayerSkillClearChecksApiResponse>('/sheet/player/skill/clearchecks')
			.then((res) => {
				if (res.data.status === 'success') {
					setNotify((n) => !n);
					return;
				}
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

	const availableSkillsList = useMemo(
		() =>
			availableSkills.map((skill) => {
				let name = skill.name;
				if (skill.specializationName) name = `${skill.specializationName} (${name})`;
				return {
					id: skill.id,
					name,
				};
			}),
		[availableSkills]
	);

	return (
		<SheetContainer
			title={props.title}
			containerProps={{ display: 'flex', flexDirection: 'column', height: '100%' }}
			sideButton={
				<IconButton aria-label='Add Skill'>
					<AddIcon />
				</IconButton>
			}>
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
				flex={{ sm: '1 0', xs: undefined }}
				height={{ sm: undefined, xs: 350 }}
				style={{ overflowY: 'auto' }}>
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
									notifyClearChecked={notify}
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
	notifyClearChecked: boolean;
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

	useEffect(() => {
		if (!componentDidMount.current) {
			componentDidMount.current = true;
			return;
		}
		if (checked) setChecked(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.notifyClearChecked]);

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
			</div>
			<Box
				sx={{
					':hover': {
						cursor: 'pointer',
						textDecoration: 'underline',
					},
				}}>
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
