import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { Armor, Trade, TradeType, Weapon } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useRef, useState } from 'react';
import {
	AddDataDialogContext,
	ApiContext,
	LoggerContext,
	SocketContext,
	TradeDialogContext,
} from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ArmorSheetApiResponse } from '../../../pages/api/sheet/armor';
import type {
	PlayerArmorApiResponse,
	PlayerGetArmorApiResponse,
} from '../../../pages/api/sheet/player/armor';
import type { PlayerListApiResponse } from '../../../pages/api/sheet/player/list';
import type { TradeArmorApiResponse } from '../../../pages/api/sheet/player/trade/armor';
import type { TradeWeaponApiResponse } from '../../../pages/api/sheet/player/trade/weapon';
import type {
	PlayerGetWeaponApiResponse,
	PlayerWeaponApiResponse,
} from '../../../pages/api/sheet/player/weapon';
import type { WeaponSheetApiResponse } from '../../../pages/api/sheet/weapon';
import { handleDefaultApiResponse } from '../../../utils';
import type { ArmorTradeObject, WeaponTradeObject } from '../../../utils/socket';
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

export type PlayerCombatContainerProps = {
	title: string;
	playerWeapons: ({ [T in keyof Weapon]: Weapon[T] } & { currentAmmo: number })[];
	playerArmor: Armor[];
	senderTrade: Trade | null;
	receiverTrade: Trade | null;
};

const PlayerCombatContainer: React.FC<PlayerCombatContainerProps> = (props) => {
	const [trade, setTrade] = useState<{ id: number; type: TradeType }>();
	const [loading, setLoading] = useState(false);
	const [playerWeapons, setPlayerWeapons] = useState(props.playerWeapons);
	const [playerArmor, setPlayerArmor] = useState(props.playerArmor);
	const tradeTimeout = useRef<NodeJS.Timeout | null>(null);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const addDataDialog = useContext(AddDataDialogContext);
	const tradeDialog = useContext(TradeDialogContext);
	const socket = useContext(SocketContext);
	const { t } = useI18n<Locale>();

	const openTradeRequest = async (trade: Trade) => {
		if (trade.type !== 'weapon' && trade.type !== 'armor') return;

		const listRequest = (
			await api.get<PlayerListApiResponse>('/sheet/player/list', {
				params: { id: trade.sender_id },
			})
		).data;
		const itemRequest = (
			await api.get<PlayerGetArmorApiResponse | PlayerGetWeaponApiResponse>(
				`/sheet/player/${trade.type}`,
				{
					params: { playerId: trade.sender_id, [`${trade.type}Id`]: trade.sender_object_id },
				}
			)
		).data;

		let receiverEquipmentName: string | undefined = undefined;

		if (trade.type === 'weapon')
			receiverEquipmentName = playerWeapons.find((it) => it.id === trade.receiver_object_id)?.name;
		else receiverEquipmentName = playerArmor.find((it) => it.id === trade.receiver_object_id)?.name;

		let senderName = t('unknown');
		if (listRequest.status === 'success' && listRequest.players.length > 0)
			senderName = listRequest.players[0].name || senderName;

		let senderItemName = t('unknown');
		if (itemRequest.status === 'success') {
			if ('weapon' in itemRequest && itemRequest.weapon.length > 0)
				senderItemName = itemRequest.weapon[0].name || senderItemName;
			else if ('armor' in itemRequest && itemRequest.armor.length > 0)
				senderItemName = itemRequest.armor[0].name || senderItemName;
		}

		tradeDialog.openRequest({
			from: senderName,
			offer: senderItemName,
			for: receiverEquipmentName,
			onResponse: async (accept) => {
				tradeDialog.closeDialog();
				if (trade.type === 'weapon') {
					const res = await api.post<TradeWeaponApiResponse>('/sheet/player/trade/item', {
						tradeId: trade.id,
						accept,
					});

					if (!accept) return;

					if (res.data.status === 'failure')
						return log({ severity: 'error', text: 'Trade Error: ' + res.data.reason });

					const newWeapon = res.data.weapon as NonNullable<typeof res.data.weapon>;

					if (trade.receiver_object_id) {
						setPlayerWeapons((weapons) =>
							weapons.map((weapon) => {
								if (weapon.id === trade.receiver_object_id)
									return { ...newWeapon, ...newWeapon.Weapon };
								return weapon;
							})
						);
					} else {
						setPlayerWeapons((weapons) => [...weapons, { ...newWeapon, ...newWeapon.Weapon }]);
					}

					return;
				}

				const res = await api.post<TradeArmorApiResponse>('/sheet/player/trade/item', {
					tradeId: trade.id,
					accept,
				});

				if (!accept) return;

				if (res.data.status === 'failure')
					return log({ severity: 'error', text: 'Trade Error: ' + res.data.reason });

				const newArmor = res.data.armor as NonNullable<typeof res.data.armor>;

				if (trade.receiver_object_id) {
					setPlayerArmor((armor) =>
						armor.map((ar) => {
							if (ar.id === trade.receiver_object_id) return newArmor;
							return ar;
						})
					);
				} else {
					setPlayerArmor((weapons) => [...weapons, newArmor]);
				}
			},
		});
	};

	useEffect(() => {
		if (
			props.senderTrade &&
			(props.senderTrade.type === 'weapon' || props.senderTrade.type === 'armor')
		) {
			setLoading(true);
			setTrade(props.senderTrade);
		}
		if (props.receiverTrade) openTradeRequest(props.receiverTrade);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.senderTrade, props.receiverTrade]);

	useEffect(() => {
		socket.on('playerTradeRequest', openTradeRequest);

		socket.on('playerTradeResponse', (trade, accept, _tradeObject) => {
			if (trade.type !== 'weapon' && trade.type !== 'armor') return;

			if (tradeTimeout.current) {
				clearTimeout(tradeTimeout.current);
				tradeTimeout.current = null;
			}

			if (accept) {
				if (trade.type === 'weapon') {
					const tradeObject = _tradeObject as WeaponTradeObject | undefined;

					if (tradeObject) {
						setPlayerWeapons((weapons) =>
							weapons.map((weapon) => {
								if (weapon.id === tradeObject.Weapon.id)
									return { ...tradeObject, ...tradeObject.Weapon };
								return weapon;
							})
						);
					} else {
						setPlayerWeapons((weapons) =>
							weapons.filter((weapon) => weapon.id !== trade.sender_object_id)
						);
					}
					return;
				}

				const tradeObject = _tradeObject as ArmorTradeObject | undefined;

				if (tradeObject) {
					setPlayerArmor((armor) =>
						armor.map((arm) => {
							if (arm.id === tradeObject.Armor.id) return { ...tradeObject, ...tradeObject.Armor };
							return arm;
						})
					);
				} else {
					setPlayerArmor((armor) => armor.filter((arm) => arm.id !== trade.sender_object_id));
				}
				log({ severity: 'success', text: 'TODO: Trade accepted.' });
			} else {
				log({ severity: 'warning', text: 'TODO: Trade rejected.' });
			}
			setLoading(false);
			setTrade(undefined);
		});

		return () => {
			socket.off('playerTradeRequest');
			socket.off('playerTradeResponse');
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket, playerWeapons, playerArmor, openTradeRequest]);

	const onDeleteWeapon = (id: number) => {
		setLoading(true);
		api
			.delete<PlayerWeaponApiResponse>('/sheet/player/weapon', {
				data: { id },
			})
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setPlayerWeapons((e) => e.filter((e) => e.id !== id));
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const onDeleteArmor = (id: number) => {
		setLoading(true);
		api
			.delete<PlayerArmorApiResponse>('/sheet/player/armor', {
				data: { id },
			})
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setPlayerArmor((a) => a.filter((e) => e.id !== id));
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
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
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const loadAvailableWeapons = () => {
		setLoading(true);
		api
			.get<WeaponSheetApiResponse>('/sheet/weapon')
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const weapons = res.data.weapon;
				if (weapons.length === 0) return log({ text: 'TODO: No weapons.' });
				return addDataDialog.openDialog(weapons, (id) => onAddEquipment(id, 'weapon'));
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const loadAvailableArmor = () => {
		setLoading(true);
		api
			.get<ArmorSheetApiResponse>('/sheet/armor')
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const armor = res.data.armor;
				if (armor.length === 0) return log({ text: 'TODO: No armor.' });
				return addDataDialog.openDialog(armor, (id) => onAddEquipment(id, 'armor'));
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const onTrade = (type: Extract<TradeType, 'weapon' | 'armor'>, id: number) => {
		setLoading(true);

		let equipment = { id: 0, name: '' };

		if (type === 'weapon')
			equipment = playerWeapons.find((i) => i.id === id) as typeof playerWeapons[number];
		else equipment = playerArmor.find((i) => i.id === id) as typeof playerArmor[number];

		api
			.get<PlayerListApiResponse>('/sheet/player/list')
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				tradeDialog.openDialog(
					type,
					equipment.id,
					res.data.players,
					type === 'weapon' ? playerWeapons : playerArmor,
					(partnerId, partnerItemId) => onTradeSubmit(type, equipment.id, partnerId, partnerItemId)
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onTradeSubmit = (
		type: Extract<TradeType, 'weapon' | 'armor'>,
		offerId: number,
		partnerId: number,
		partnerItemId?: number
	) => {
		tradeDialog.closeDialog();

		setLoading(true);

		api
			.put<TradeWeaponApiResponse | TradeArmorApiResponse>(`/sheet/player/trade/${type}`, {
				offerId,
				to: partnerId,
				for: partnerItemId,
			})
			.then((res) => {
				if (res.data.status === 'failure')
					return log({ severity: 'error', text: 'Trade Error: ' + res.data.reason });
				setTrade(res.data.trade);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			);
	};

	const onTradeCancel = () => {
		if (!trade || !confirm(t('prompt.delete'))) return;

		api
			.delete<TradeWeaponApiResponse | TradeArmorApiResponse>(`/sheet/player/trade/${trade.type}`, {
				data: { tradeId: trade.id },
			})
			.then((res) => {
				if (res.data.status === 'failure') {
					return;
				}
				setTrade(undefined);
				setLoading(false);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			);
	};

	return (
		<SheetContainer
			title={props.title}
			position='relative'
			sideButton={
				<>
					<Tooltip title={`${t('add')} ${t('armor')}`} describeChild>
						<IconButton onClick={loadAvailableArmor} sx={{ mr: 1 }}>
							<ArmorIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={`${t('add')} ${t('weapon')}`} describeChild>
						<IconButton onClick={loadAvailableWeapons}>
							<WeaponIcon />
						</IconButton>
					</Tooltip>
				</>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
				{trade && (
					<Button variant='contained' onClick={onTradeCancel}>
						TODO: Cancel Trade
					</Button>
				)}
			</PartialBackdrop>
			<PlayerWeaponContainer
				playerWeapons={playerWeapons}
				onDeleteWeapon={onDeleteWeapon}
				onTrade={onTrade}
			/>
			<PlayerArmorContainer
				playerArmor={playerArmor}
				onDeleteArmor={onDeleteArmor}
				onTrade={onTrade}
			/>
		</SheetContainer>
	);
};

export default PlayerCombatContainer;
