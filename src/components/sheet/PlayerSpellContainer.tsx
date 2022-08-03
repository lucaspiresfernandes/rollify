import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import Box from '@mui/material/Box';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import dice20 from '../../../public/dice20.webp';
import TableRow from '@mui/material/TableRow';
import type { Spell } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { AddDataDialogContext, ApiContext, DiceRollContext, LoggerContext } from '../../contexts';
import type { Locale } from '../../i18n';
import type { PlayerSpellApiResponse } from '../../pages/api/sheet/player/spell';
import type { SpellSheetApiResponse } from '../../pages/api/sheet/spell';
import { handleDefaultApiResponse } from '../../utils';
import PartialBackdrop from '../PartialBackdrop';
import SheetContainer from './Section';
import Image from 'next/image';
import { resolveDices } from '../../utils/dice';

type PlayerSpellContainerProps = {
	title: string;
	playerSpells: Spell[];
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
				if (spells.length === 0) return log({ text: 'TODO: No spells.' });
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

	return (
		<SheetContainer
			title={props.title}
			position='relative'
			sideButton={
				<IconButton aria-label='Add Spell' onClick={loadAvailableSpells}>
					<AddIcon />
				</IconButton>
			}>
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

type PlayerSpellFieldProps = { [T in keyof Spell]: Spell[T] } & {
	onDelete: () => void;
};

const PlayerSpellField: React.FC<PlayerSpellFieldProps> = (props) => {
	const [open, setOpen] = useState(false);
	const rollDice = useContext(DiceRollContext);

	const handleDiceClick = () => {
		const aux = resolveDices(props.damage);
		if (aux) rollDice(aux);
	};

	return (
		<>
			<TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
				<TableCell align='center' padding='none'>
					<IconButton
						title={open ? 'Collapse' : 'Expand'}
						size='small'
						onClick={() => setOpen(!open)}>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell align='center' padding='none'>
					<IconButton size='small' onClick={props.onDelete}>
						<DeleteIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center'>{props.name}</TableCell>
				<TableCell align='center'>{props.type}</TableCell>
				<TableCell align='center'>{props.cost}</TableCell>
				<TableCell align='center'>
					<Box
						display='flex'
						flexDirection='row'
						justifyContent='center'
						alignItems='center'
						gap={1}>
						<div>{props.damage}</div>
						{props.damage !== '-' && (
							<div>
								<Image
									src={dice20}
									alt='Dice'
									className='clickable'
									onClick={handleDiceClick}
									width={30}
									height={30}
								/>
							</div>
						)}
					</Box>
				</TableCell>
				<TableCell align='center'>{props.target}</TableCell>
				<TableCell align='center'>{props.range}</TableCell>
				<TableCell align='center'>{props.castingTime}</TableCell>
				<TableCell align='center'>{props.duration}</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
					<Collapse in={open}>
						<Typography variant='h5' component='div' mb={1} px={3}>
							{props.description}
						</Typography>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

export default PlayerSpellContainer;
