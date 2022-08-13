import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import type { Spell } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import { useContext, useMemo, useState } from 'react';
import dice20 from '../../../public/dice20.webp';
import { AddDataDialogContext, ApiContext, DiceRollContext, LoggerContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { PlayerApiResponse } from '../../pages/api/sheet/player';
import type { PlayerSpellApiResponse } from '../../pages/api/sheet/player/spell';
import type { SpellSheetApiResponse } from '../../pages/api/sheet/spell';
import { handleDefaultApiResponse } from '../../utils';
import { resolveDices } from '../../utils/dice';
import PartialBackdrop from '../PartialBackdrop';
import SheetContainer from './Section';

type PlayerSpellContainerProps = {
	title: string;
	playerSpells: Spell[];
	playerMaxSlots: number;
};

const PlayerSpellContainer: React.FC<PlayerSpellContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [playerSpells, setPlayerSpells] = useState(props.playerSpells);

	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const addDataDialog = useContext(AddDataDialogContext);
	const { t } = useI18n<Locale>();

	const onAddSpell = (id: number) => {
		addDataDialog.closeDialog();
		setLoading(true);
		api
			.put<PlayerSpellApiResponse>('/sheet/player/spell', { id })
			.then((res) => {
				if (res.data.status === 'success') {
					const spell = res.data.spell;
					return setPlayerSpells([...playerSpells, { ...spell }]);
				}
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const loadAvailableSpells = () => {
		setLoading(true);
		api
			.get<SpellSheetApiResponse>('/sheet/spell')
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const spells = res.data.spell;
				if (spells.length === 0) return log({ text: t('prompt.noItemsFound') });
				addDataDialog.openDialog(spells, onAddSpell);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const onDeleteSpell = async (id: number) => {
		if (!confirm(t('prompt.delete', { name: 'item' }))) return;
		setLoading(true);
		api
			.delete<PlayerSpellApiResponse>('/sheet/player/spell', {
				data: { id },
			})
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setPlayerSpells((s) => s.filter((spell) => spell.id !== id));
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const playerCurrentSlots = useMemo(
		() => playerSpells.reduce((prev, cur) => prev + cur.slots, 0),
		[playerSpells]
	);

	return (
		<SheetContainer
			title={props.title}
			position='relative'
			sideButton={
				<IconButton aria-label='Add Spell' onClick={loadAvailableSpells}>
					<AddIcon />
				</IconButton>
			}>
			<Box textAlign='center' mt={2} mb={1}>
				<PlayerMaxSlotsField
					playerCurrentSlots={playerCurrentSlots}
					playerMaxSlots={props.playerMaxSlots}
				/>
			</Box>
			<Divider sx={{ mt: 2, mb: 1 }} />
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding='none' />
							<TableCell padding='none' />
							<TableCell align='center'>{t('sheet.table.name')}</TableCell>
							<TableCell align='center'>{t('sheet.table.type')}</TableCell>
							<TableCell align='center'>{t('sheet.table.cost')}</TableCell>
							<TableCell align='center'>{t('sheet.table.damage')}</TableCell>
							<TableCell align='center'>{t('sheet.table.target')}</TableCell>
							<TableCell align='center'>{t('sheet.table.range')}</TableCell>
							<TableCell align='center'>{t('sheet.table.castingTime')}</TableCell>
							<TableCell align='center'>{t('sheet.table.duration')}</TableCell>
							<TableCell align='center'>{t('sheet.table.slots')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{playerSpells.map((spell) => (
							<PlayerSpellField
								key={spell.id}
								{...spell}
								onDelete={() => onDeleteSpell(spell.id)}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
		</SheetContainer>
	);
};

const PlayerMaxSlotsField: React.FC<{
	playerCurrentSlots: number;
	playerMaxSlots: number;
}> = (props) => {
	const [maxSlots, setMaxSlots, isMaxSlotsClean] = useExtendedState(props.playerMaxSlots);
	const api = useContext(ApiContext);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onMaxSlotsBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
		if (isMaxSlotsClean()) return;
		api
			.post<PlayerApiResponse>('/sheet/player', { maxSlots })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const overload = props.playerCurrentSlots > maxSlots;

	return (
		<TextField
			variant='outlined'
			label={t('slots')}
			autoComplete='off'
			color={overload ? 'error' : undefined}
			focused={overload || undefined}
			InputProps={{
				startAdornment: (
					<InputAdornment
						position='start'
						sx={{ mr: 0 }}>{`${props.playerCurrentSlots}/`}</InputAdornment>
				),
			}}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			value={maxSlots}
			onChange={(ev) => {
				if (ev.target.validity.valid) setMaxSlots(parseInt(ev.target.value) || 0);
			}}
			onBlur={onMaxSlotsBlur}
		/>
	);
};

type PlayerSpellFieldProps = { [T in keyof Spell]: Spell[T] } & {
	onDelete: () => void;
};

const PlayerSpellField: React.FC<PlayerSpellFieldProps> = (props) => {
	const [open, setOpen] = useState(false);
	const { t } = useI18n<Locale>();
	const rollDice = useContext(DiceRollContext);

	const handleDiceClick = () => {
		const aux = resolveDices(props.damage);
		if (aux) rollDice(aux);
	};

	return (
		<>
			<TableRow
				sx={{ '& > *': { borderBottom: props.description ? 'unset !important' : undefined } }}>
				<TableCell align='center' padding='none'>
					{props.description && (
						<IconButton
							title={open ? t('collapse') : t('expand')}
							size='small'
							onClick={() => setOpen(!open)}>
							{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					)}
				</TableCell>
				<TableCell align='center' padding='none'>
					<IconButton size='small' onClick={props.onDelete} title={t('delete')}>
						<DeleteIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center'>{props.name}</TableCell>
				<TableCell align='center'>{props.type || '-'}</TableCell>
				<TableCell align='center'>{props.cost || '-'}</TableCell>
				<TableCell align='center'>
					<Box
						display='flex'
						flexDirection='row'
						justifyContent='center'
						alignItems='center'
						gap={1}>
						<div>{props.damage || '-'}</div>
						{props.damage && (
							<Image
								layout='fixed'
								src={dice20}
								alt='Dice'
								className='clickable'
								onClick={handleDiceClick}
								width={30}
								height={30}
							/>
						)}
					</Box>
				</TableCell>
				<TableCell align='center'>{props.target || '-'}</TableCell>
				<TableCell align='center'>{props.range || '-'}</TableCell>
				<TableCell align='center'>{props.castingTime || '-'}</TableCell>
				<TableCell align='center'>{props.duration || '-'}</TableCell>
				<TableCell align='center'>{props.slots || '-'}</TableCell>
			</TableRow>
			{props.description && (
				<TableRow>
					<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
						<Collapse in={open} unmountOnExit>
							<Typography variant='body1' component='div' mb={1} px={3}>
								{props.description}
							</Typography>
						</Collapse>
					</TableCell>
				</TableRow>
			)}
		</>
	);
};

export default PlayerSpellContainer;
