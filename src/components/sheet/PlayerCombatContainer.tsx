import AddIcon from '@mui/icons-material/AddCircleOutlined';
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
import type { Equipment } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import SheetContainer from '../../components/sheet/Container';
import { ApiContext, LoggerContext, SocketContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { PlayerEquipmentApiResponse } from '../../pages/api/sheet/player/equipment';
import type { TradeEquipmentApiResponse } from '../../pages/api/sheet/player/trade/equipment';
import { handleDefaultApiResponse } from '../../utils';
import type {
	EquipmentAddEvent,
	EquipmentChangeEvent,
	EquipmentRemoveEvent,
	PlayerTradeRequestEvent,
	PlayerTradeResponseEvent,
} from '../../utils/socket';

type PlayerCombatContainerProps = {
	title: string;
	playerEquipments: {
		Equipment: Equipment;
		currentAmmo: number;
	}[];
	availableEquipments: {
		id: number;
		name: string;
	}[];
	partners: {
		id: number;
		name: string;
	}[];
};

// const tradeInitialValue: Trade<Equipment> = {
// 	type: 'equipment',
// 	show: false,
// 	offer: { id: 0, name: '' } as Equipment,
// 	donation: true,
// };

const TRADE_TIME_LIMIT = 10000;

const PlayerCombatContainer: React.FC<PlayerCombatContainerProps> = (props) => {
	const [addEquipmentShow, setAddEquipmentShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [availableEquipments, setAvailableEquipments] = useState(props.availableEquipments);
	const [playerEquipments, setPlayerEquipments] = useState(props.playerEquipments);
	// const [trade, setTrade] = useState<Trade<Equipment>>(tradeInitialValue);

	// const [diceRollResultModalProps, onDiceRoll] = useDiceRoll();

	const currentTradeId = useRef<number | null>(null);
	const tradeTimeout = useRef<NodeJS.Timeout | null>(null);

	const socket = useContext(SocketContext);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n();

	const socket_equipmentAdd = useRef<EquipmentAddEvent>(() => {});
	const socket_equipmentRemove = useRef<EquipmentRemoveEvent>(() => {});
	const socket_equipmentChange = useRef<EquipmentChangeEvent>(() => {});
	const socket_requestReceived = useRef<PlayerTradeRequestEvent>(() => {});
	const socket_responseReceived = useRef<PlayerTradeResponseEvent>(() => {});

	useEffect(() => {
		socket_equipmentAdd.current = (id, name) => {
			if (availableEquipments.findIndex((eq) => eq.id === id) > -1) return;
			setAvailableEquipments((equipments) => [...equipments, { id, name }]);
		};

		socket_equipmentRemove.current = (id) => {
			const index = playerEquipments.findIndex((eq) => eq.Equipment.id === id);
			if (index === -1) return;

			setPlayerEquipments((equipments) => {
				const newEquipments = [...equipments];
				newEquipments.splice(index, 1);
				return newEquipments;
			});
		};

		socket_equipmentChange.current = (eq) => {
			const availableIndex = availableEquipments.findIndex((_eq) => _eq.id === eq.id);
			const playerIndex = playerEquipments.findIndex((_eq) => _eq.Equipment.id === eq.id);

			if (eq.visible) {
				if (availableIndex === -1 && playerIndex === -1)
					return setAvailableEquipments((equipments) => [...equipments, eq]);
			} else if (availableIndex > -1) {
				return setAvailableEquipments((equipments) => {
					const newEquipments = [...equipments];
					newEquipments.splice(availableIndex, 1);
					return newEquipments;
				});
			}

			if (availableIndex > -1) {
				setAvailableEquipments((equipments) => {
					const newEquipments = [...equipments];
					newEquipments[availableIndex] = {
						id: eq.id,
						name: eq.name,
					};
					return newEquipments;
				});
				return;
			}

			if (playerIndex === -1) return;

			setPlayerEquipments((equipments) => {
				const newEquipments = [...equipments];
				newEquipments[playerIndex].Equipment = eq;
				return newEquipments;
			});
		};

		socket_requestReceived.current = (
			type,
			tradeId,
			receiverObjectId,
			senderName,
			equipmentName
		) => {
			if (type !== 'equipment') return;

			currentTradeId.current = tradeId;

			const equip = playerEquipments.find((eq) => eq.Equipment.id === receiverObjectId);

			const accept = confirm(
				`${senderName} te ofereceu ${equipmentName}${
					receiverObjectId ? ` em troca de ${equip?.Equipment.name}.` : '.'
				}` + ' Você deseja aceitar essa proposta?'
			);

			api
				.post<TradeEquipmentApiResponse>('/sheet/player/trade/equipment', {
					tradeId,
					accept,
				})
				.then(({ data }) => {
					if (data.status === 'failure') {
						switch (data.reason) {
							case 'trade_does_not_exist':
								return log({ text: 'This trade does not exist anymore.', severity: 'warning' });
							default:
								return log({ text: `Unknown error. Reason: ${data.reason}`, severity: 'error' });
						}
					}

					const newEquip = data.equipment;

					if (!accept || !newEquip) return;

					if (receiverObjectId) {
						const index = playerEquipments.findIndex((eq) => eq.Equipment.id === receiverObjectId);
						if (index === -1) return;
						const oldEq = playerEquipments[index];

						availableEquipments.push(oldEq.Equipment);
						playerEquipments[index] = newEquip;
					} else {
						playerEquipments.push(newEquip);
					}
					availableEquipments.splice(
						availableEquipments.findIndex((e) => e.id === newEquip.Equipment.id),
						1
					);

					setPlayerEquipments([...playerEquipments]);
					setAvailableEquipments([...availableEquipments]);
				})
				.catch(log)
				.finally(() => (currentTradeId.current = null));
		};

		socket_responseReceived.current = (accept, tradeRes) => {
			if (!currentTradeId.current) return;

			currentTradeId.current = null;
			if (tradeTimeout.current) {
				clearTimeout(tradeTimeout.current);
				tradeTimeout.current = null;
			}

			if (accept) {
				// const index = playerEquipments.findIndex((e) => e.Equipment.id === trade.offer.id);
				// if (index === -1) return;
				// if (tradeRes) {
				// 	if (tradeRes.type !== 'equipment')
				// 		return log({ text: 'Expected equipment', severity: 'error' });
				// 	const oldEq = playerEquipments[index];
				// 	availableEquipments.push(oldEq.Equipment);
				// 	availableEquipments.splice(
				// 		availableEquipments.findIndex((e) => e.id === tradeRes.obj.Equipment.id),
				// 		1
				// 	);
				// 	setAvailableEquipments([...availableEquipments]);
				// 	playerEquipments[index] = tradeRes.obj;
				// } else {
				// 	const eq = playerEquipments.splice(index, 1)[0];
				// 	setAvailableEquipments((e) => [...e, eq.Equipment]);
				// }
				// setPlayerEquipments([...playerEquipments]);
			} else {
				log({ text: 'Trade rejected.', severity: 'info' });
			}
			setLoading(false);
			// setTrade(tradeInitialValue);
		};
	});

	useEffect(() => {
		socket.on('equipmentAdd', (id, name) => socket_equipmentAdd.current(id, name));
		socket.on('equipmentRemove', (id) => socket_equipmentRemove.current(id));
		socket.on('equipmentChange', (eq) => socket_equipmentChange.current(eq));
		socket.on(
			'playerTradeRequest',
			(type, tradeId, receiverObjectId, senderName, senderObjectName) =>
				socket_requestReceived.current(
					type,
					tradeId,
					receiverObjectId,
					senderName,
					senderObjectName
				)
		);
		socket.on('playerTradeResponse', (accept, eq) => socket_responseReceived.current(accept, eq));
		return () => {
			socket.off('equipmentAdd');
			socket.off('equipmentRemove');
			socket.off('equipmentChange');
			socket.off('playerTradeRequest');
			socket.off('playerTradeResponse');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDeleteEquipment = async (id: number) => {
		if (!confirm('Você realmente deseja excluir esse equipamento?')) return;
		setLoading(true);
		api
			.delete<PlayerEquipmentApiResponse>('/sheet/player/equipment', {
				data: { id },
			})
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log);
				const newPlayerEquipments = [...playerEquipments];
				const index = newPlayerEquipments.findIndex((eq) => eq.Equipment.id === id);

				if (index === -1) return;

				newPlayerEquipments.splice(index, 1);
				setPlayerEquipments(newPlayerEquipments);

				const modalEquipment = { id, name: playerEquipments[index].Equipment.name };
				setAvailableEquipments([...availableEquipments, modalEquipment]);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	return (
		<SheetContainer
			title={props.title}
			containerProps={{ display: 'flex', flexDirection: 'column', height: '100%' }}
			sideButton={
				<IconButton aria-label='Add Equipment'>
					<AddIcon />
				</IconButton>
			}>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell></TableCell>
							{props.partners.length > 0 && (
								<>
									<TableCell></TableCell>
									<TableCell></TableCell>
								</>
							)}
							<TableCell align='center'>{t('sheet.equipment.name')}</TableCell>
							<TableCell align='center'>{t('sheet.equipment.type')}</TableCell>
							<TableCell align='center'>{t('sheet.equipment.damage')}</TableCell>
							<TableCell align='center'></TableCell>
							<TableCell align='center'>{t('sheet.equipment.range')}</TableCell>
							<TableCell align='center'>{t('sheet.equipment.attacks')}</TableCell>
							<TableCell align='center'>{t('sheet.equipment.currentAmmo')}</TableCell>
							<TableCell align='center'>{t('sheet.equipment.ammo')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{playerEquipments.map((eq) => (
							<PlayerCombatField
								key={eq.Equipment.id}
								currentAmmo={eq.currentAmmo}
								equipment={eq.Equipment}
								disableTrades={props.partners.length === 0}
								onDelete={() => onDeleteEquipment(eq.Equipment.id)}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</SheetContainer>
	);
};

type PlayerCombatFieldProps = {
	currentAmmo: number;
	equipment: Equipment;
	disableTrades?: boolean;
	onDelete: () => void;
};

const PlayerCombatField: React.FC<PlayerCombatFieldProps> = (props) => {
	const [currentAmmo, setCurrentAmmo, isClean] = useExtendedState(props.currentAmmo);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	const onAmmoChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const aux = ev.target.value;
		let newAmmo = parseInt(aux) || 0;
		setCurrentAmmo(newAmmo);
	};

	const onAmmoBlur: React.FocusEventHandler<HTMLInputElement> = (ev) => {
		if (isClean()) return;
		let newAmmo = currentAmmo;

		if (props.equipment.ammo && currentAmmo > props.equipment.ammo) newAmmo = props.equipment.ammo;

		setCurrentAmmo(newAmmo);

		api
			.post<PlayerEquipmentApiResponse>('/sheet/player/equipment', {
				id: props.equipment.id,
				currentAmmo: newAmmo,
			})
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: err.message }));
	};

	return (
		<>
			<TableRow>
				<TableCell align='center'>
					<IconButton size='small' onClick={props.onDelete}>
						<DeleteIcon />
					</IconButton>
				</TableCell>
				{!props.disableTrades && (
					<>
						<TableCell align='center'>
							<IconButton size='small'>
								<VolunteerActivismIcon />
							</IconButton>
						</TableCell>
						<TableCell align='center'>
							<IconButton size='small'>
								<HandshakeIcon />
							</IconButton>
						</TableCell>
					</>
				)}
				<TableCell align='center'>{props.equipment.name}</TableCell>
				<TableCell align='center'>{props.equipment.type}</TableCell>
				<TableCell align='center'>{props.equipment.damage}</TableCell>
				<TableCell align='center'>
					<Image
						src='/dice20.webp'
						alt='Dice'
						// onClick={(ev) => rollDice(ev.ctrlKey)}
						width={35}
						height={35}
					/>
				</TableCell>
				<TableCell align='center'>{props.equipment.range}</TableCell>
				<TableCell align='center'>{props.equipment.attacks}</TableCell>
				<TableCell align='center'>
					{props.equipment.ammo ? (
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
				<TableCell align='center'>{props.equipment.ammo || '-'}</TableCell>
			</TableRow>
		</>
	);
};

export default PlayerCombatContainer;
