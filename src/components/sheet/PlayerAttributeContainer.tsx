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
import { ApiContext, LoggerContext } from '../../contexts';
import type { Locale } from '../../i18n';
import type { PlayerAttributeApiResponse } from '../../pages/api/sheet/player/attribute';
import type { PlayerAttributeStatusApiResponse } from '../../pages/api/sheet/player/attribute/status';
import type { PlayerGetAvatarApiResponse } from '../../pages/api/sheet/player/avatar/[attrStatusID]';
import styles from '../../styles/modules/PlayerAttributeContainer.module.css';
import { clamp, handleDefaultApiResponse } from '../../utils';
import type { DiceConfig } from '../../utils/dice';

const AVATAR_SIZE = getAvatarSize(0.75);

const BAR_HEIGHT = 35;

type AttributeEditor = { id: number; value: number; maxValue: number; show: boolean };

const editorInitialValue: AttributeEditor = {
	id: 0,
	value: 0,
	maxValue: 0,
	show: false,
};

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
	attributeDiceConfig: DiceConfig['attribute'];
};

const PlayerAttributeContainer: React.FC<PlayerAttributeContainerProps> = (props) => {
	// const [diceRollResultModalProps, onDiceRoll] = useDiceRoll(props.npcId);
	const [attrEditor, setAttrEditor] = useState<AttributeEditor>(editorInitialValue);
	const [playerAttributeStatus, setPlayerAttributeStatus] = useState(props.playerAttributeStatus);
	const [notify, setNotify] = useState(false);

	const onStatusChanged = (id: number, newValue: boolean) => {
		const newPlayerStatus = [...playerAttributeStatus];
		const index = newPlayerStatus.findIndex((stat) => stat.id === id);
		newPlayerStatus[index].value = newValue;
		setPlayerAttributeStatus(newPlayerStatus);
	};

	return (
		<Stack px={2} my={2} spacing={3}>
			<PlayerAvatarImage
				statusID={playerAttributeStatus.find((stat) => stat.value)?.id}
				rerender={notify}
				playerAvatars={props.playerAvatars}
				onAvatarUpdate={() => setNotify((n) => !n)}
			/>
			{props.playerAttributes.map((attr) => {
				const status = playerAttributeStatus.filter((stat) => stat.attributeId === attr.id);

				return (
					<PlayerAttributeField
						key={attr.id}
						{...attr}
						status={status}
						onStatusChanged={onStatusChanged}
						editor={attrEditor}
						onEdit={(id, value, maxValue) => setAttrEditor({ id, value, maxValue, show: true })}
						visibilityEnabled={attr.portrait != null}
						attributeDiceConfig={props.attributeDiceConfig}
					/>
				);
			})}
			{/* <PlayerAttributeEditorModal
				value={attrEditor}
				onHide={() => setAttrEditor(editorInitialValue)}
				onSubmit={(value, maxValue) =>
					setAttrEditor((e) => ({ id: e.id, value, maxValue, show: false }))
				}
			/>
			<DiceRollModal {...diceRollResultModalProps} /> */}
		</Stack>
	);
};

type PlayerAvatarImageProps = {
	statusID?: number;
	rerender: boolean;
	onAvatarUpdate?: () => void;
	playerAvatars: {
		link: string | null;
		attributeStatus: {
			id: number;
			name: string;
		} | null;
	}[];
};

const PlayerAvatarImage: React.FC<PlayerAvatarImageProps> = (props) => {
	const statusID = props.statusID || 0;

	const [src, setSrc] = useState('/avatar404.png');
	// const [avatarModalShow, setAvatarModalShow] = useState(false);
	const previousStatusID = useRef(statusID);
	const api = useContext(ApiContext);

	useEffect(() => {
		api
			.get<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${statusID}`)
			.then(({ data }) => {
				if (data.status === 'success') {
					setSrc(data.link);
					return;
				}
				setSrc('/avatar404.png');
			})
			.catch(() => setSrc('/avatar404.png'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.rerender]);

	useEffect(() => {
		if (statusID === previousStatusID.current) return;
		previousStatusID.current = statusID;
		api
			.get<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${statusID}`)
			.then(({ data }) => {
				if (data.status === 'success') {
					setSrc(data.link);
					return;
				}
				setSrc('/avatar404.png');
			})
			.catch(() => setSrc('/avatar404.png'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.statusID]);

	return (
		<Box display='flex' alignItems='center' justifyContent='end' gap={2}>
			<Image
				src={src}
				alt='Character Avatar'
				className={styles.clickable}
				width={AVATAR_SIZE[0]}
				height={AVATAR_SIZE[1]}
				onError={() => setSrc('/avatar404.png')}
				// onClick={() => setAvatarModalShow(true)}
			/>
			<Image
				src='/dice20.webp'
				alt='Dado Geral'
				className={styles.clickable}
				width={80}
				height={80}
				// onClick={(ev) => {
				// 	if (ev.ctrlKey) return rollDice({ dices: DEFAULT_ROLL });
				// 	setShow(true);
				// }}
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
	onEdit: (id: number, value: number, maxValue: number) => void;
	attributeDiceConfig: DiceConfig['attribute'];
	// showDiceRollResult: DiceRollEvent;
	visibilityEnabled: boolean;
	editor: { id: number; value: number; maxValue: number };
};

const PlayerAttributeField: React.FC<PlayerAttributeFieldProps> = (props) => {
	const [show, setShow] = useState(props.show);
	const [value, setValue] = useState(props.value);
	const [maxValue, setMaxValue] = useState(props.maxValue);
	const barRef = useRef<HTMLDivElement>(null);
	const timeout = useRef<{ timeout?: NodeJS.Timeout; lastValue: number }>({
		lastValue: value,
	});
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

	useEffect(() => {
		if (props.editor.id !== props.id) return;
		const newValue = props.editor.value;
		const newMaxValue = props.editor.maxValue;

		setValue(newValue);
		setMaxValue(newMaxValue);

		api
			.post<PlayerAttributeApiResponse>('/sheet/player/attribute', {
				id: props.id,
				value: newValue,
				maxValue: newMaxValue,
			})
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: 'Unknown error: ' + err.message }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.editor]);

	const onShowChange: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
		const newShow = !show;
		setShow(newShow);
		api
			.post<PlayerAttributeApiResponse>('/sheet/player/attribute', {
				id: props.id,
				show: newShow,
			})
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: err.message }));
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
					.then((res) => handleDefaultApiResponse(res, log))
					.catch((err) => log({ severity: 'error', text: err.message }))
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
				flexWrap='wrap'>
				<Typography variant='body1' component='label' htmlFor={`attributeBar${props.id}`}>
					{t('sheet.attributePoints', { name: props.name })}
				</Typography>
				<div>
					<IconButton
						aria-label='add'
						size='small'
						onClick={(ev) => updateValue(1, ev.ctrlKey)}
						sx={{ mr: 1 }}>
						<AddIcon />
					</IconButton>
					<IconButton
						aria-label='subtract'
						size='small'
						onClick={(ev) => updateValue(-1, ev.ctrlKey)}>
						<RemoveIcon />
					</IconButton>
				</div>
			</Box>
			<Box display='flex' flexDirection='row' alignItems='center'>
				{props.visibilityEnabled && (
					<IconButton aria-label={show ? 'Hide' : 'Show'} onClick={onShowChange}>
						{show ? <VisibilityIcon /> : <VisibilityOffIcon />}
					</IconButton>
				)}
				<Box
					flex='1 0'
					mx={1}
					position='relative'
					style={{ cursor: 'pointer' }}
					onClick={() => props.onEdit(props.id, value, maxValue)}>
					<LinearProgress
						variant='determinate'
						id={`attributeBar${props.id}`}
						value={Math.min((value / maxValue || 0) * 100, 100)}
						ref={barRef}
						style={{
							height: BAR_HEIGHT,
							borderRadius: 2,
							backgroundColor: `#${props.color}40`,
						}}
					/>
					<div className={styles.labelContainer}>
						{value > maxValue ? <b>{value}</b> : value}/{maxValue}
					</div>
				</Box>
				{props.rollable && (
					<Image
						src='/dice20.webp'
						alt='Dice'
						className={styles.clickable}
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
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }));
	};

	return (
		<FormControlLabel
			id={`attributeStatus${props.id}`}
			control={<Checkbox checked={checked} onChange={changeValue} size='small' />}
			label={props.name}
		/>
	);
};

function getAvatarSize(ratio: number): [number, number] {
	return [420 * ratio, 600 * ratio];
}

export default PlayerAttributeContainer;
