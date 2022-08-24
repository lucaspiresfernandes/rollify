import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import type { Spell } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import { useContext, useMemo, useState } from 'react';
import dice from '../../../public/dice.webp';
import { AddDataDialogContext, ApiContext, DiceRollContext, LoggerContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { PlayerApiResponse } from '../../pages/api/sheet/player';
import type { PlayerSpellApiResponse } from '../../pages/api/sheet/player/spell';
import type { SpellSheetApiResponse } from '../../pages/api/sheet/spell';
import { handleDefaultApiResponse } from '../../utils';
import { resolveDices } from '../../utils/dice';
import SpellEditorDialog from '../admin/dialogs/editor/SpellEditorDialog';
import PartialBackdrop from '../PartialBackdrop';
import SheetContainer from './Section';

type PlayerSpellContainerProps = {
	title: string;
	playerSpells: ({ [T in keyof Spell]: Spell[T] } & {
		currentDescription: string;
	})[];
	playerMaxSlots: number;
};

const PlayerSpellContainer: React.FC<PlayerSpellContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [playerSpells, setPlayerSpells] = useState(props.playerSpells);
	const [spellDialogOpen, setSpellDialogOpen] = useState(false);
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
					return setPlayerSpells([...playerSpells, { ...spell, ...spell.Spell }]);
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
				addDataDialog.openDialog(spells, onAddSpell, () => {
					addDataDialog.closeDialog();
					setSpellDialogOpen(true);
				});
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

	const onCreateSpell = (data: Spell) => {
		setSpellDialogOpen(false);
		setLoading(true);
		api
			.put<SpellSheetApiResponse>('/sheet/spell', data)
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const memoSpell = useMemo(
		() => ({
			spells: playerSpells.sort((a, b) => a.name.localeCompare(b.name)),
			currentSlots: playerSpells.reduce((prev, cur) => prev + cur.slots, 0),
		}),
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
					playerCurrentSlots={memoSpell.currentSlots}
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
						{memoSpell.spells.map((spell) => (
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
			<SpellEditorDialog
				title={`${t('add')} ${t('admin.editor.weapon')}`}
				open={spellDialogOpen}
				onClose={() => setSpellDialogOpen(false)}
				onSubmit={onCreateSpell}
			/>
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
			size='small'
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

type PlayerSpellFieldProps = PlayerSpellContainerProps['playerSpells'][number] & {
	onDelete: () => void;
};

const PlayerSpellField: React.FC<PlayerSpellFieldProps> = (props) => {
	const [currentDescription, setCurrentDescription, isDescriptionClean] = useExtendedState(
		props.currentDescription
	);
	const [open, setOpen] = useState(false);
	const { t } = useI18n<Locale>();
	const api = useContext(ApiContext);
	const log = useContext(LoggerContext);
	const rollDice = useContext(DiceRollContext);
	const [damageAnchorElement, setDamageAnchorElement] = useState<null | HTMLElement>(null);

	const damageList = useMemo(() => props.damage.replace(/\s/g, '').split('|'), [props.damage]);

	const handleDiceImageClick: React.MouseEventHandler<HTMLImageElement> = (ev) => {
		if (damageList.length > 1 && damageAnchorElement === null)
			return setDamageAnchorElement(ev.currentTarget);

		const aux = resolveDices(props.damage, t);
		if (aux) rollDice(aux);
	};

	const handleDiceMenuClick = (damage: string) => {
		setDamageAnchorElement(null);
		const aux = resolveDices(damage, t);
		if (aux) rollDice(aux);
	};

	const descriptionBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isDescriptionClean()) return;
		api
			.post<PlayerSpellApiResponse>('/sheet/player/spell', { id: props.id, currentDescription })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<>
			<TableRow sx={{ '& > *': { borderBottom: 'unset !important' } }}>
				<TableCell align='center' padding='none'>
					<IconButton
						title={open ? t('collapse') : t('expand')}
						size='small'
						onClick={() => setOpen(!open)}>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
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
						{props.damage ? (
							<Image
								layout='fixed'
								src={dice}
								alt='Dice'
								title={props.damage}
								className='clickable'
								onClick={handleDiceImageClick}
								width={30}
								height={30}
							/>
						) : (
							'-'
						)}
					</Box>
					{damageList.length > 1 && (
						<Menu
							anchorEl={damageAnchorElement}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(damageAnchorElement)}
							onClose={() => setDamageAnchorElement(null)}
							PaperProps={{ style: { maxHeight: 200 } }}>
							{damageList.map((damage, index) => (
								<MenuItem key={index} onClick={() => handleDiceMenuClick(damage)}>
									{damage}
								</MenuItem>
							))}
						</Menu>
					)}
				</TableCell>
				<TableCell align='center'>{props.target || '-'}</TableCell>
				<TableCell align='center'>{props.range || '-'}</TableCell>
				<TableCell align='center'>{props.castingTime || '-'}</TableCell>
				<TableCell align='center'>{props.duration || '-'}</TableCell>
				<TableCell align='center'>{props.slots || '-'}</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
					<Collapse in={open} unmountOnExit>
						<Box py={1} px={2}>
							<TextField
								fullWidth
								multiline
								size='small'
								value={currentDescription}
								onChange={(ev) => setCurrentDescription(ev.target.value)}
								onBlur={descriptionBlur}
								style={{ minWidth: '25em' }}
								inputProps={{ 'aria-label': 'Description' }}
							/>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

export default PlayerSpellContainer;
