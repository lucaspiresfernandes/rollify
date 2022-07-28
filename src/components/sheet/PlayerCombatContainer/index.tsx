import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { Armor, Weapon } from '@prisma/client';
import { useContext, useState } from 'react';
import { AddDataContext, ApiContext, LoggerContext } from '../../../contexts';
import type { ArmorSheetApiResponse } from '../../../pages/api/sheet/armor';
import type { PlayerArmorApiResponse } from '../../../pages/api/sheet/player/armor';
import type { PlayerWeaponApiResponse } from '../../../pages/api/sheet/player/weapon';
import type { WeaponSheetApiResponse } from '../../../pages/api/sheet/weapon';
import { handleDefaultApiResponse } from '../../../utils';
import PartialBackdrop from '../../PartialBackdrop';
import SheetContainer from '../Section';
import PlayerArmorContainer from './PlayerArmorContainer';
import PlayerWeaponContainer from './PlayerWeaponContainer';

const WeaponIcon: React.FC = () => (
	<svg focusable='false' aria-hidden='true' viewBox='0 0 24 24' width='1em' height='1em'>
		<path
			fill='currentColor'
			d='M6.92 5H5l9 9l1-.94m4.96 6.06l-.84.84a.996.996 0 0 1-1.41 0l-3.12-3.12l-2.68 2.66l-1.41-1.41l1.42-1.42L3 7.75V3h4.75l8.92 8.92l1.42-1.42l1.41 1.41l-2.67 2.67l3.12 3.12c.4.4.4 1.03.01 1.42Z'></path>
	</svg>
);

const ArmorIcon: React.FC = () => (
	<svg focusable='false' aria-hidden='true' viewBox='0 0 24 24' width='1em' height='1em'>
		<path
			fill='currentColor'
			d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4Z'
		/>
	</svg>
);

type PlayerWeapon = { [T in keyof Weapon]: Weapon[T] } & { currentAmmo: number };

export type PlayerCombatContainerProps = {
	title: string;
	playerWeapons: PlayerWeapon[];
	playerArmor: Armor[];
};

const PlayerCombatContainer: React.FC<PlayerCombatContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [playerWeapons, setPlayerWeapons] = useState(props.playerWeapons);
	const [playerArmor, setPlayerArmor] = useState(props.playerArmor);

	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const addDataDialog = useContext(AddDataContext);

	const onDeleteWeapon = (id: number) => {
		setLoading(true);
		api
			.delete<PlayerWeaponApiResponse>('/sheet/player/weapon', {
				data: { id },
			})
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log);
				setPlayerWeapons((e) => e.filter((e) => e.id !== id));
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const onDeleteArmor = (id: number) => {
		setLoading(true);
		api
			.delete<PlayerArmorApiResponse>('/sheet/player/armor', {
				data: { id },
			})
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log);
				setPlayerArmor((a) => a.filter((e) => e.id !== id));
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const onAddEquipment = (id: number, type: 'armor' | 'weapon') => {
		setLoading(true);
		addDataDialog.closeDialog();

		api
			.put<PlayerArmorApiResponse | PlayerWeaponApiResponse>('/sheet/player/' + type, { id })
			.then((res) => {
				if (res.data.status === 'success') {
					if ('weapon' in res.data) {
						const weapon = res.data.weapon;
						setPlayerWeapons([...playerWeapons, { ...weapon, ...weapon.Weapon }]);
					} else if ('armor' in res.data) {
						const armor = res.data.armor;
						setPlayerArmor([...playerArmor, { ...armor }]);
					}
					return;
				}
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const loadAvailableWeapons = () => {
		setLoading(true);
		api
			.get<WeaponSheetApiResponse>('/sheet/weapon')
			.then((res) => {
				if (res.data.status === 'success')
					return addDataDialog.openDialog(res.data.weapon, (id) => onAddEquipment(id, 'weapon'));
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const loadAvailableArmor = () => {
		setLoading(true);
		api
			.get<ArmorSheetApiResponse>('/sheet/armor')
			.then((res) => {
				if (res.data.status === 'success')
					return addDataDialog.openDialog(res.data.armor, (id) => onAddEquipment(id, 'armor'));
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	return (
		<SheetContainer
			title={props.title}
			sx={{ position: 'relative' }}
			sideButton={
				<>
					<Tooltip title='TODO: Add Armor' describeChild>
						<IconButton onClick={loadAvailableArmor} sx={{ mr: 1 }}>
							<ArmorIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title='TODO: Add Weapon' describeChild>
						<IconButton onClick={loadAvailableWeapons}>
							<WeaponIcon />
						</IconButton>
					</Tooltip>
				</>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<PlayerWeaponContainer playerWeapons={playerWeapons} onDeleteWeapon={onDeleteWeapon} />
			<PlayerArmorContainer playerArmor={playerArmor} onDeleteArmor={onDeleteArmor} />
		</SheetContainer>
	);
};

export default PlayerCombatContainer;
