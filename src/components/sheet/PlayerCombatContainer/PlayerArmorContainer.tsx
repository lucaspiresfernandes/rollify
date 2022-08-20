import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { TradeType } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { ArmorIcon, PlayerCombatContainerProps } from '.';
import { ApiContext, LoggerContext } from '../../../contexts';
import useExtendedState from '../../../hooks/useExtendedState';
import type { Locale } from '../../../i18n';
import type { PlayerArmorApiResponse } from '../../../pages/api/sheet/player/armor';
import { handleDefaultApiResponse } from '../../../utils';

type PlayerArmorContainerProps = {
	playerArmor: PlayerCombatContainerProps['playerArmor'];
	onDeleteArmor: (id: number) => void;
	onTrade: (type: Extract<TradeType, 'weapon' | 'armor'>, id: number) => void;
};

const PlayerArmorContainer: React.FC<PlayerArmorContainerProps> = (props) => {
	const { t } = useI18n<Locale>();

	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell padding='none'>
							<Typography
								variant='h5'
								component='div'
								display='flex'
								justifyContent='center'
								alignItems='center'>
								<ArmorIcon />
							</Typography>
						</TableCell>
						<TableCell padding='none' />
						<TableCell padding='none' />
						<TableCell align='center'>{t('sheet.table.name')}</TableCell>
						<TableCell align='center'>{t('sheet.table.type')}</TableCell>
						<TableCell align='center'>{t('sheet.table.weight')}</TableCell>
						<TableCell align='center'>{t('sheet.table.damageReduction')}</TableCell>
						<TableCell align='center'>{t('sheet.table.penalty')}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{props.playerArmor.map((armor) => (
						<PlayerArmorField
							key={armor.id}
							{...armor}
							onDelete={() => props.onDeleteArmor(armor.id)}
							onTrade={() => props.onTrade('armor', armor.id)}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

type PlayerArmorFieldProps = PlayerArmorContainerProps['playerArmor'][number] & {
	onDelete: () => void;
	onTrade: () => void;
};

const PlayerArmorField: React.FC<PlayerArmorFieldProps> = (props) => {
	const [currentDescription, setCurrentDescription, isDescriptionClean] = useExtendedState(
		props.currentDescription
	);
	const [open, setOpen] = useState(false);
	const { t } = useI18n<Locale>();
	const api = useContext(ApiContext);
	const log = useContext(LoggerContext);

	const descriptionBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isDescriptionClean()) return;
		api
			.post<PlayerArmorApiResponse>('/sheet/player/armor', { id: props.id, currentDescription })
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
					<IconButton
						size='small'
						onClick={() => {
							if (confirm(t('prompt.delete', { name: 'item' }))) props.onDelete();
						}}
						title={t('delete')}>
						<DeleteIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center' padding='none'>
					<IconButton size='small' onClick={props.onTrade} title={t('trade')}>
						<HandshakeIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center'>{props.name}</TableCell>
				<TableCell align='center'>{props.type || '-'}</TableCell>
				<TableCell align='center'>{props.weight || '-'}</TableCell>
				<TableCell align='center'>{props.damageReduction || '-'}</TableCell>
				<TableCell align='center'>{props.penalty || '-'}</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
					<Collapse in={open}>
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

export default PlayerArmorContainer;
