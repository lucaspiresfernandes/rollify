import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Spell } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import SheetContainer from './Section';
import { AddDataContext, ApiContext, LoggerContext } from '../../contexts';
import type { Locale } from '../../i18n';
import type { PlayerSpellApiResponse } from '../../pages/api/sheet/player/spell';
import type { SpellSheetApiResponse } from '../../pages/api/sheet/spell';
import { handleDefaultApiResponse } from '../../utils';
import PartialBackdrop from '../PartialBackdrop';

type PlayerSpellContainerProps = {
	title: string;
	playerSpells: Spell[];
};

const PlayerSpellContainer: React.FC<PlayerSpellContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [playerSpells, setPlayerSpells] = useState(props.playerSpells);

	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const addDataDialog = useContext(AddDataContext);
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
				if (res.data.status === 'success') {
					const spells = res.data.spell;
					addDataDialog.openDialog(spells, onAddSpell);
					return;
				}
				handleDefaultApiResponse(res, log, t);
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
							<TableCell padding='none'></TableCell>
							<TableCell padding='none'></TableCell>
							<TableCell padding='none'></TableCell>
							<TableCell align='center'>{t('sheet.table.name')}</TableCell>
							<TableCell align='center'>{t('sheet.table.description')}</TableCell>
							<TableCell align='center'>{t('sheet.table.weight')}</TableCell>
							<TableCell align='center'>{t('sheet.table.quantity')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{playerSpells.map((it) => (
							<PlayerSpellField key={it.id} {...it} onDelete={() => onDeleteSpell(it.id)} />
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

type PlayerSpellFieldProps = {
	id: number;
	name: string;
	onDelete: () => void;
};

const PlayerSpellField: React.FC<PlayerSpellFieldProps> = (props) => {
	return (
		<>
			<TableRow>
				<TableCell align='center' padding='none'>
					<IconButton size='small' onClick={props.onDelete}>
						<DeleteIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center' padding='none'>
					<IconButton size='small'>
						<VolunteerActivismIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center' padding='none'>
					<IconButton size='small'>
						<HandshakeIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center'></TableCell>
				<TableCell align='center'></TableCell>
				<TableCell align='center'></TableCell>
				<TableCell align='center'></TableCell>
			</TableRow>
		</>
	);
};

export default PlayerSpellContainer;
