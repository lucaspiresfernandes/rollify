import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PortraitAttribute } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import dice20 from '../../../public/dice20.webp';
import { ApiContext, DiceRollContext, LoggerContext } from '../../contexts';
import type { Locale } from '../../i18n';
import type { PlayerAttributeApiResponse } from '../../pages/api/sheet/player/attribute';
import type { PlayerAttributeStatusApiResponse } from '../../pages/api/sheet/player/attribute/status';
import type { PlayerGetAvatarApiResponse } from '../../pages/api/sheet/player/avatar/[attrStatusID]';
import styles from '../../styles/modules/PlayerAttributeContainer.module.css';
import { clamp, getAvatarSize, handleDefaultApiResponse } from '../../utils';
import type { DiceConfig } from '../../utils/dice';
import GeneralDiceRollDialog, {
	GeneralDiceRollDialogSubmitHandler,
} from '../GeneralDiceRollDialog';
import PlayerAttributeEditorDialog from './dialogs/PlayerAttributeEditorDialog';
import PlayerAvatarDialog from './dialogs/PlayerAvatarDialog';

const AVATAR_SIZE = getAvatarSize(0.85);

const BAR_HEIGHT = 35;

type PlayerAttributeContainerProps = {
	playerAttributes: {
		id: number;
		name: string;
		value: number;
		maxValue: number;
		show: boolean;
		color: string;
		rollable: boolean;
		portrait: PortraitAttribute | null;
	}[];
	playerAttributeStatus: {
		id: number;
		name: string;
		value: boolean;
		attributeId: number;
	}[];
	playerAvatars: {
		link: string | null;
		attributeStatus: {
			id: number;
			name: string;
		} | null;
	}[];
	baseDice: DiceConfig['baseDice'];
};

const PlayerAttributeContainer: React.FC<PlayerAttributeContainerProps> = (props) => {
	const [playerAttributeStatus, setPlayerAttributeStatus] = useState(props.playerAttributeStatus);

	const onStatusChanged = (id: number, newValue: boolean) => {
		setPlayerAttributeStatus((a) =>
			a.map((status) => {
				if (status.id === id) return { ...status, value: newValue };
				return status;
			})
		);
	};

	return (
		<Stack spacing={1}>
			<PlayerAvatarImage
				statusID={playerAttributeStatus.find((stat) => stat.value)?.id}
				playerAvatars={props.playerAvatars}
				baseDice={props.baseDice}
			/>
			{props.playerAttributes.map((attr) => {
				const status = playerAttributeStatus.filter((stat) => stat.attributeId === attr.id);

				return (
					<PlayerAttributeField
						key={attr.id}
						{...attr}
						status={status}
						onStatusChanged={onStatusChanged}
						visibilityEnabled={attr.portrait != null}
					/>
				);
			})}
		</Stack>
	);
};

type PlayerAvatarImageProps = {
	statusID?: number;
	playerAvatars: {
		link: string | null;
		attributeStatus: {
			id: number;
			name: string;
		} | null;
	}[];
	baseDice: DiceConfig['baseDice'];
};

const PlayerAvatarImage: React.FC<PlayerAvatarImageProps> = (props) => {
	const [src, setSrc] = useState('#');
	const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
	const [generalDiceDialogOpen, setGeneralDiceDialogOpen] = useState(false);

	const statusId = props.statusID || 0;
	const previousStatusId = useRef(Number.MAX_SAFE_INTEGER);

	const rollDice = useContext(DiceRollContext);
	const api = useContext(ApiContext);

	const updateAvatar = () => {
		api
			.post<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${statusId}`)
			.then(({ data }) => {
				if (data.status === 'success') return setSrc(data.link);
				setSrc('/avatar404.png');
			})
			.catch(() => setSrc('/avatar404.png'));
	};

	useEffect(() => {
		if (statusId === previousStatusId.current) return;
		previousStatusId.current = statusId;
		updateAvatar();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusId]);

	const onGeneralDiceDialogSubmit: GeneralDiceRollDialogSubmitHandler = (dice) => {
		setGeneralDiceDialogOpen(false);
		if (dice.length > 0) rollDice(dice);
	};

	return (
		<Box display='flex' alignItems='center' justifyContent='space-around' gap={3}>
			<div>
				<img
					src={src}
					alt='Character Avatar'
					className='clickable'
					style={{ width: '100%', maxWidth: AVATAR_SIZE[0], height: 'auto' }}
					onError={() => {
						if (src !== '#') setSrc('/avatar404.png');
					}}
					onClick={() => setAvatarDialogOpen(true)}
				/>
			</div>
			<GeneralDiceRollDialog
				open={generalDiceDialogOpen}
				onClose={() => setGeneralDiceDialogOpen(false)}
				onSubmit={onGeneralDiceDialogSubmit}>
				<div>
					<Image
						src={dice20}
						alt='D20'
						layout='fixed'
						className='clickable'
						width={80}
						height={80}
						onClick={(ev) => {
							if (ev.ctrlKey) return rollDice([{ num: 1, roll: props.baseDice }]);
							setGeneralDiceDialogOpen(true);
						}}
					/>
				</div>
			</GeneralDiceRollDialog>
			<PlayerAvatarDialog
				playerAvatars={props.playerAvatars}
				open={avatarDialogOpen}
				onClose={() => setAvatarDialogOpen(false)}
				onSubmit={() => {
					setAvatarDialogOpen(false);
					updateAvatar();
				}}
			/>
		</Box>
	);
};

type PlayerAttributeFieldProps = {
	id: number;
	name: string;
	value: number;
	maxValue: number;
	show: boolean;
	color: string;
	rollable: boolean;

	status: {
		id: number;
		name: string;
		value: boolean;
	}[];

	onStatusChanged: (id: number, newValue: boolean) => void;
	visibilityEnabled: boolean;
};

const PlayerAttributeField: React.FC<PlayerAttributeFieldProps> = (props) => {
	const [attrEditorOpen, setAttrEditorOpen] = useState(false);
	const [show, setShow] = useState(props.show);
	const [value, setValue] = useState(props.value);
	const [maxValue, setMaxValue] = useState(props.maxValue);
	const barRef = useRef<HTMLDivElement>(null);
	const timeout = useRef<{ timeout?: NodeJS.Timeout; lastValue: number }>({
		lastValue: value,
	});
	const rollDice = useContext(DiceRollContext);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (barRef.current === null) return;
		const innerBar = barRef.current.querySelector('.MuiLinearProgress-bar') as HTMLSpanElement;
		if (innerBar) innerBar.style.backgroundColor = `#${props.color}`;
	}, [barRef, props.color]);

	useEffect(() => {
		if (timeout.current.timeout) clearTimeout(timeout.current.timeout);
	}, [maxValue]);

	const onEditorSubmit = (newValue: number, newMaxValue: number) => {
		setAttrEditorOpen(false);
		setValue(newValue);
		setMaxValue(newMaxValue);
		api
			.post<PlayerAttributeApiResponse>('/sheet/player/attribute', {
				id: props.id,
				value: newValue,
				maxValue: newMaxValue,
			})
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const handleDiceClick = (standalone: boolean) => {
		rollDice({
			num: standalone ? 1 : undefined,
			ref: value,
		});
	};

	const onShowChange: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
		const newShow = !show;
		setShow(newShow);
		api
			.post<PlayerAttributeApiResponse>('/sheet/player/attribute', {
				id: props.id,
				show: newShow,
			})
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const updateValue = (coeff: number, multiply: boolean) => {
		let newVal: number = value;
		if (multiply) {
			coeff *= 5;
			if (coeff > 0) {
				if (value <= maxValue) newVal = clamp(value + coeff, 0, maxValue);
			} else newVal = Math.max(0, value + coeff);
		} else {
			newVal = Math.max(0, value + coeff);
		}

		if (value === newVal) return;

		setValue(newVal);

		if (timeout.current.timeout) {
			clearTimeout(timeout.current.timeout);
			if (timeout.current.lastValue === newVal) return;
		}

		timeout.current.timeout = setTimeout(
			() =>
				api
					.post<PlayerAttributeApiResponse>('/sheet/player/attribute', {
						id: props.id,
						value: newVal,
					})
					.then((res) => handleDefaultApiResponse(res, log, t))
					.catch(() => log({ severity: 'error', text: t('error.unknown') }))
					.finally(() => (timeout.current.lastValue = newVal)),
			750
		);
	};

	return (
		<div>
			<Box
				display='flex'
				flexDirection='row'
				alignItems='end'
				justifyContent='space-between'
				mb={0.5}>
				<Typography variant='body1' component='label' id={`attributeBar${props.id}`}>
					{t('sheet.attributePoints', { name: props.name })}
				</Typography>
				<div>
					<IconButton
						title={t('subtract')}
						size='small'
						onClick={(ev) => updateValue(-1, ev.ctrlKey)}
						sx={{ mr: 1 }}>
						<RemoveIcon />
					</IconButton>
					<IconButton title={t('add')} size='small' onClick={(ev) => updateValue(1, ev.ctrlKey)}>
						<AddIcon />
					</IconButton>
				</div>
			</Box>
			<Box display='flex' flexDirection='row' alignItems='center'>
				{props.visibilityEnabled && (
					<IconButton onClick={onShowChange} size='small' title={show ? t('hide') : t('show')}>
						{show ? <VisibilityIcon /> : <VisibilityOffIcon />}
					</IconButton>
				)}
				<Box
					flex='1 0'
					mx={1}
					position='relative'
					className='clickable'
					onClick={() => setAttrEditorOpen(true)}>
					<LinearProgress
						variant='determinate'
						aria-label={t('sheet.attributePoints', { name: props.name })}
						aria-labelledby={`attributeBar${props.id}`}
						value={Math.min((value / maxValue || 0) * 100, 100)}
						ref={barRef}
						style={{
							height: BAR_HEIGHT,
							borderRadius: 2,
							backgroundColor: `#${props.color}40`,
						}}
					/>
					<div className={styles.labelContainer}>
						{value > maxValue ? (
							<b>
								<i>{value}</i>
							</b>
						) : (
							value
						)}
						/{maxValue}
					</div>
				</Box>
				{props.rollable && (
					<Image
						src={dice20}
						alt='Dice'
						className='clickable'
						onClick={(ev) => handleDiceClick(ev.ctrlKey)}
						width={BAR_HEIGHT}
						height={BAR_HEIGHT}
					/>
				)}
			</Box>
			<div>
				<FormGroup row>
					{props.status.map((stat) => (
						<PlayerAttributeStatusField
							key={stat.id}
							{...stat}
							attributeId={props.id}
							onStatusChanged={props.onStatusChanged}
						/>
					))}
				</FormGroup>
			</div>
			<PlayerAttributeEditorDialog
				open={attrEditorOpen}
				startValue={{ value, maxValue }}
				onClose={() => setAttrEditorOpen(false)}
				onSubmit={onEditorSubmit}
			/>
		</div>
	);
};

type PlayerAttributeStatusFieldProps = {
	id: number;
	name: string;
	attributeId: number;
	value: boolean;
	onStatusChanged: (id: number, newValue: boolean) => void;
};

const PlayerAttributeStatusField: React.FC<PlayerAttributeStatusFieldProps> = (props) => {
	const [checked, setChecked] = useState(props.value);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const changeValue: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const value = ev.target.checked;
		setChecked(value);
		api
			.post<PlayerAttributeStatusApiResponse>('/sheet/player/attribute/status', {
				id: props.id,
				value,
			})
			.then((res) => {
				if (res.data.status === 'success') {
					props.onStatusChanged(props.id, value);
					return;
				}
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<FormControlLabel
			id={`attributeStatus${props.id}`}
			control={<Checkbox checked={checked} onChange={changeValue} size='small' />}
			label={props.name}
		/>
	);
};

export default PlayerAttributeContainer;
