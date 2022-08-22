import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import Image from 'next/image';
import { useContext, useMemo, useState } from 'react';
import { PlayerCombatContainerProps, WeaponIcon } from '.';
import dice20 from '../../../../public/dice20.webp';
import { ApiContext, DiceRollContext, LoggerContext } from '../../../contexts';
import useExtendedState from '../../../hooks/useExtendedState';
import type { Locale } from '../../../i18n';
import type { PlayerWeaponApiResponse } from '../../../pages/api/sheet/player/weapon';
import { handleDefaultApiResponse } from '../../../utils';
import { resolveDices } from '../../../utils/dice';

type PlayerWeaponContainerProps = {
	playerWeapons: PlayerCombatContainerProps['playerWeapons'];
	onDeleteWeapon: (id: number) => void;
	onTrade: (type: Extract<TradeType, 'weapon' | 'armor'>, id: number) => void;
};

const PlayerWeaponContainer: React.FC<PlayerWeaponContainerProps> = (props) => {
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
								<WeaponIcon />
							</Typography>
						</TableCell>
						<TableCell padding='none' />
						<TableCell padding='none' />
						<TableCell align='center'>{t('sheet.table.name')}</TableCell>
						<TableCell align='center'>{t('sheet.table.type')}</TableCell>
						<TableCell align='center'>{t('sheet.table.weight')}</TableCell>
						<TableCell align='center' padding='none'>
							{t('sheet.table.damage')}
						</TableCell>
						<TableCell align='center'>{t('sheet.table.range')}</TableCell>
						<TableCell align='center'>{t('sheet.table.attacks')}</TableCell>
						<TableCell align='center'>{t('sheet.table.ammo')}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{props.playerWeapons.map((weapon) => (
						<PlayerWeaponField
							key={weapon.id}
							{...weapon}
							onDelete={() => {
								if (confirm(t('prompt.delete', { name: 'item' }))) props.onDeleteWeapon(weapon.id);
							}}
							onTrade={() => props.onTrade('weapon', weapon.id)}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

type PlayerWeaponFieldProps = PlayerWeaponContainerProps['playerWeapons'][number] & {
	onDelete: () => void;
	onTrade: () => void;
};

const PlayerWeaponField: React.FC<PlayerWeaponFieldProps> = (props) => {
	const [open, setOpen] = useState(false);
	const [currentAmmo, setCurrentAmmo, isClean] = useExtendedState(props.currentAmmo);
	const [currentDescription, setCurrentDescription, isDescriptionClean] = useExtendedState(
		props.currentDescription
	);
	const [damageAnchorElement, setDamageAnchorElement] = useState<null | HTMLElement>(null);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const rollDice = useContext(DiceRollContext);
	const { t } = useI18n<Locale>();

	const damageList = useMemo(() => props.damage.replace(/\s/g, '').split('|'), [props.damage]);

	const handleDiceImageClick: React.MouseEventHandler<HTMLImageElement> = (ev) => {
		if (props.ammo && !currentAmmo) return alert(t('prompt.noAmmo'));

		if (damageList.length > 1 && damageAnchorElement === null)
			return setDamageAnchorElement(ev.currentTarget);

		const aux = resolveDices(props.damage, t);

		if (!aux) return;

		rollDice(aux);

		const ammo = currentAmmo - 1;
		setCurrentAmmo(ammo);
		api
			.post<PlayerWeaponApiResponse>('/sheet/player/weapon', {
				id: props.id,
				currentAmmo: ammo,
			})
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const handleDiceMenuClick = (damage: string) => {
		setDamageAnchorElement(null);

		const aux = resolveDices(damage, t);

		if (!aux) return;

		rollDice(aux);

		const ammo = currentAmmo - 1;
		setCurrentAmmo(ammo);
		api
			.post<PlayerWeaponApiResponse>('/sheet/player/weapon', {
				id: props.id,
				currentAmmo: ammo,
			})
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const onAmmoChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		if (ev.target.validity.valid) setCurrentAmmo(parseInt(ev.target.value) || 0);
	};

	const onAmmoBlur: React.FocusEventHandler<HTMLInputElement> = (ev) => {
		let newAmmo = currentAmmo;
		if (props.ammo && currentAmmo > props.ammo) newAmmo = props.ammo;
		setCurrentAmmo(newAmmo);

		if (isClean()) return;

		api
			.post<PlayerWeaponApiResponse>('/sheet/player/weapon', {
				id: props.id,
				currentAmmo: newAmmo,
			})
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const descriptionBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isDescriptionClean()) return;
		api
			.post<PlayerWeaponApiResponse>('/sheet/player/weapon', { id: props.id, currentDescription })
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
				<TableCell align='center' padding='none'>
					<IconButton size='small' onClick={props.onTrade} title={t('trade')}>
						<HandshakeIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center'>{props.name}</TableCell>
				<TableCell align='center'>{props.type || '-'}</TableCell>
				<TableCell align='center'>{props.weight || '-'}</TableCell>
				<TableCell align='center' padding='none'>
					<Box
						display='flex'
						flexDirection='row'
						justifyContent='center'
						alignItems='center'
						gap={1}>
						{props.damage ? (
							<Image
								layout='fixed'
								src={dice20}
								alt='Dice'
								className='clickable'
								title={props.damage}
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
				<TableCell align='center'>{props.range || '-'}</TableCell>
				<TableCell align='center'>{props.attacks || '-'}</TableCell>
				<TableCell align='center'>
					{props.ammo ? (
						<TextField
							variant='outlined'
							size='small'
							value={currentAmmo}
							onChange={onAmmoChange}
							onBlur={onAmmoBlur}
							InputProps={{
								endAdornment: (
									<InputAdornment position='end' sx={{ ml: 0 }}>{`/${props.ammo}`}</InputAdornment>
								),
							}}
							inputProps={{
								style: { textAlign: 'end', width: '3em' },
								'aria-label': t('sheet.table.ammo'),
							}}
						/>
					) : (
						'-'
					)}
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
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

export default PlayerWeaponContainer;
