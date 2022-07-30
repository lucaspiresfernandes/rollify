import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import type { Weapon } from '@prisma/client';
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
};

const PlayerWeaponContainer: React.FC<PlayerWeaponContainerProps> = (props) => {
	const { t } = useI18n<Locale>();

	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell padding='none'></TableCell>
						<TableCell padding='none'></TableCell>
						<TableCell padding='none'></TableCell>
						<TableCell align='center'>{t('sheet.table.name')}</TableCell>
						<TableCell align='center'>{t('sheet.table.type')}</TableCell>
						<TableCell align='center'>{t('sheet.table.damage')}</TableCell>
						<TableCell align='center' padding='none'></TableCell>
						<TableCell align='center'>{t('sheet.table.range')}</TableCell>
						<TableCell align='center'>{t('sheet.table.attacks')}</TableCell>
						<TableCell align='center'>{t('sheet.table.currentAmmo')}</TableCell>
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
};

const PlayerWeaponField: React.FC<PlayerWeaponFieldProps> = (props) => {
	const [currentAmmo, setCurrentAmmo, isClean] = useExtendedState(props.currentAmmo);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const rollDice = useContext(DiceRollContext);
	const { t } = useI18n<Locale>();

	const handleDiceClick = () => {
		if (props.ammo && currentAmmo === 0) return alert(t('prompt.noAmmo'));

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
		const aux = ev.target.value;
		let newAmmo = parseInt(aux) || 0;
		setCurrentAmmo(newAmmo);
	};

	const onAmmoBlur: React.FocusEventHandler<HTMLInputElement> = (ev) => {
		if (isClean()) return;
		let newAmmo = currentAmmo;

		if (props.ammo && currentAmmo > props.ammo) newAmmo = props.ammo;

		setCurrentAmmo(newAmmo);

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
				<TableCell align='center'>{props.name}</TableCell>
				<TableCell align='center'>{props.type}</TableCell>
				<TableCell align='center'>{props.damage}</TableCell>
				<TableCell align='center' padding='none'>
					{props.damage && (
						<Image
							src={dice20}
							alt='Dice'
							className='clickable'
							onClick={handleDiceClick}
							width={30}
							height={30}
						/>
					)}
				</TableCell>
				<TableCell align='center'>{props.range}</TableCell>
				<TableCell align='center'>{props.attacks}</TableCell>
				<TableCell align='center'>
					{props.ammo ? (
						<TextField
							variant='standard'
							value={currentAmmo}
							onChange={onAmmoChange}
							onBlur={onAmmoBlur}
						/>
					) : (
						'-'
					)}
				</TableCell>
				<TableCell align='center'>{props.ammo || '-'}</TableCell>
			</TableRow>
		</>
	);
};

export default PlayerWeaponContainer;
