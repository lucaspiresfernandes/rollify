import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { TradeType, Weapon } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import { useContext } from 'react';
import type { PlayerCombatContainerProps } from '.';
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

type PlayerWeaponFieldProps = { [T in keyof Weapon]: Weapon[T] } & {
	currentAmmo: number;
	onDelete: () => void;
	onTrade: () => void;
};

const PlayerWeaponField: React.FC<PlayerWeaponFieldProps> = (props) => {
	const [currentAmmo, setCurrentAmmo, isClean] = useExtendedState(props.currentAmmo);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const rollDice = useContext(DiceRollContext);
	const { t } = useI18n<Locale>();

	const handleDiceClick = () => {
		if (props.ammo && !currentAmmo) return alert(t('prompt.noAmmo'));

		const aux = resolveDices(props.damage);

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

	return (
		<>
			<TableRow>
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
				<TableCell align='center'>{props.range || '-'}</TableCell>
				<TableCell align='center'>{props.attacks || '-'}</TableCell>
				<TableCell align='center'>
					{props.ammo ? (
						<TextField
							variant='standard'
							value={currentAmmo}
							onChange={onAmmoChange}
							onBlur={onAmmoBlur}
							sx={{ width: '3em' }}
							InputProps={{
								endAdornment: (
									<Typography variant='body1' color='GrayText' lineHeight='inherit' pl={0.2}>
										/{props.ammo}
									</Typography>
								),
							}}
							inputProps={{
								style: { textAlign: 'end' },
							}}
						/>
					) : (
						'-'
					)}
				</TableCell>
			</TableRow>
		</>
	);
};

export default PlayerWeaponContainer;
