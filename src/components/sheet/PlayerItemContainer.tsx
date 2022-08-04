import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import type { Trade } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useState } from 'react';
import {
	AddDataDialogContext,
	ApiContext,
	LoggerContext,
	SocketContext,
	TradeDialogContext,
} from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { ItemSheetApiResponse } from '../../pages/api/sheet/item';
import type {
	PlayerGetItemApiResponse,
	PlayerItemApiResponse,
} from '../../pages/api/sheet/player/item';
import type { PlayerListApiResponse } from '../../pages/api/sheet/player/list';
import type { TradeItemApiResponse } from '../../pages/api/sheet/player/trade/item';
import { handleDefaultApiResponse } from '../../utils';
import type { ItemTradeObject } from '../../utils/socket';
import PartialBackdrop from '../PartialBackdrop';
import SheetContainer from './Section';
import type { PlayerApiResponse } from '../../pages/api/sheet/player';

export type PlayerItemContainerProps = {
	title: string;
	playerCurrency: {
		id: number;
		name: string;
		value: string;
	}[];
	playerItems: {
		id: number;
		name: string;
		currentDescription: string;
		quantity: number;
		weight: number;
	}[];

	playerCurrentLoad: number;
	playerMaxLoad: number;

	onItemAdd: (item: PlayerItemContainerProps['playerItems'][number]) => void;
	onItemRemove: (item: PlayerItemContainerProps['playerItems'][number]) => void;
	onItemChange: (
		oldItem: PlayerItemContainerProps['playerItems'][number],
		newItem: PlayerItemContainerProps['playerItems'][number]
	) => void;

	senderTrade: Trade | null;
	receiverTrade: Trade | null;
};

const PlayerItemContainer: React.FC<PlayerItemContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [tradeId, setTradeId] = useState<number>();
	const [playerItems, setPlayerItems] = useState(props.playerItems);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const addDataDialog = useContext(AddDataDialogContext);
	const tradeDialog = useContext(TradeDialogContext);
	const socket = useContext(SocketContext);
	const { t } = useI18n<Locale>();

	const openTradeRequest = async (trade: Trade) => {
		const listRequest = (
			await api.get<PlayerListApiResponse>('/sheet/player/list', {
				params: { id: trade.sender_id },
			})
		).data;
		const itemRequest = (
			await api.get<PlayerGetItemApiResponse>('/sheet/player/item', {
				params: { playerId: trade.sender_id, itemId: trade.sender_object_id },
			})
		).data;

		const receiverItemName = playerItems.find((it) => it.id === trade.receiver_object_id)?.name;

		let senderName = t('unknown');
		if (listRequest.status === 'success' && listRequest.players.length > 0)
			senderName = listRequest.players[0].name || senderName;

		let senderItemName = t('unknown');
		if (itemRequest.status === 'success' && itemRequest.item.length > 0)
			senderItemName = itemRequest.item[0].name || senderItemName;

		tradeDialog.openRequest({
			from: senderName,
			offer: senderItemName,
			for: receiverItemName,
			onResponse: async (accept) => {
				tradeDialog.closeDialog();

				const { data } = await api.post<TradeItemApiResponse>('/sheet/player/trade/item', {
					tradeId: trade.id,
					accept,
				});

				if (!accept) return;

				if (data.status === 'failure') {
					switch (data.reason) {
						case 'trade_does_not_exist':
							return log({ text: 'TODO: Trade already canceled by the requester.' });
						default:
							return log({ severity: 'error', text: 'Trade Error: ' + data.reason });
					}
				}

				const newItem = data.item as NonNullable<typeof data.item>;
				if (trade.receiver_object_id) {
					setPlayerItems((items) =>
						items.map((item) => {
							if (item.id === trade.receiver_object_id) return { ...newItem, ...newItem.Item };
							return item;
						})
					);
				} else setPlayerItems((items) => [...items, { ...newItem, ...newItem.Item }]);
			},
		});
	};

	useEffect(() => {
		if (props.senderTrade && props.senderTrade.type === 'item') {
			setLoading(true);
			setTradeId(props.senderTrade.id);
		} else if (props.receiverTrade) openTradeRequest(props.receiverTrade);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.senderTrade, props.receiverTrade]);

	useEffect(() => {
		socket.on('playerTradeRequest', async (trade) => {
			if (trade.type !== 'item') return;
			openTradeRequest(trade);
		});

		socket.on('playerTradeResponse', (trade, accept, _tradeObject) => {
			if (trade.type !== 'item') return;

			if (accept) {
				const tradeObject = _tradeObject as ItemTradeObject | undefined;

				if (tradeObject) {
					setPlayerItems((items) =>
						items.map((item) => {
							if (item.id === tradeObject.Item.id) return { ...tradeObject, ...tradeObject.Item };
							return item;
						})
					);
				} else {
					setPlayerItems((items) => items.filter((item) => item.id !== trade.sender_object_id));
				}
				log({ severity: 'success', text: 'TODO: Trade accepted.' });
			} else {
				log({ severity: 'warning', text: 'TODO: Trade rejected.' });
			}
			setLoading(false);
			setTradeId(undefined);
		});

		return () => {
			socket.off('playerTradeRequest');
			socket.off('playerTradeResponse');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket, playerItems, openTradeRequest]);

	const onAddItem = (id: number) => {
		addDataDialog.closeDialog();
		setLoading(true);
		api
			.put<PlayerItemApiResponse>('/sheet/player/item', { id })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);

				const newItem = {
					...res.data.item,
					...res.data.item.Item,
				};

				props.onItemAdd(newItem);
				setPlayerItems([...playerItems, newItem]);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const loadAvailableItems = () => {
		setLoading(true);
		api
			.get<ItemSheetApiResponse>('/sheet/item')
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const items = res.data.item;
				if (items.length === 0) return log({ text: 'TODO: No items.' });
				addDataDialog.openDialog(items, onAddItem);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const onDeleteItem = async (id: number) => {
		if (!confirm(t('prompt.delete', { name: 'item' }))) return;
		setLoading(true);
		api
			.delete<PlayerItemApiResponse>('/sheet/player/item', {
				data: { id },
			})
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const removedItem = playerItems.find((item) => item.id === id) as NonNullable<
					typeof playerItems[number]
				>;
				props.onItemRemove(removedItem);
				setPlayerItems((i) => i.filter((item) => item.id !== id));
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const onTrade = (id: number) => {
		setLoading(true);

		const item = playerItems.find((i) => i.id === id) as typeof playerItems[number];

		api
			.get<PlayerListApiResponse>('/sheet/player/list')
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				tradeDialog.openDialog(
					'item',
					item.id,
					res.data.players,
					playerItems,
					(partnerId, partnerItemId) => onTradeSubmit(item.id, partnerId, partnerItemId)
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onTradeSubmit = (offerId: number, partnerId: number, partnerItemId?: number) => {
		tradeDialog.closeDialog();

		setLoading(true);

		api
			.put<TradeItemApiResponse>('/sheet/player/trade/item', {
				offerId,
				to: partnerId,
				for: partnerItemId,
			})
			.then((res) => {
				if (res.data.status === 'failure') {
					log({ severity: 'error', text: 'Trade Error: ' + res.data.reason });
					return setLoading(false);
				}
				setTradeId(res.data.trade.id);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			);
	};

	const onTradeCancel = () => {
		if (!tradeId || !confirm(t('prompt.delete'))) return;

		api
			.delete<TradeItemApiResponse>('/sheet/player/trade/item', { data: { tradeId } })
			.then((res) => {
				if (res.data.status === 'failure') {
					return;
				}
				setTradeId(undefined);
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
				<IconButton onClick={loadAvailableItems} title='TODO: Add Item'>
					<AddIcon />
				</IconButton>
			}>
			<Box textAlign='center' mt={2} mb={1}>
				<PlayerMaxLoadField
					playerCurrentLoad={props.playerCurrentLoad}
					playerMaxLoad={props.playerMaxLoad}
				/>
			</Box>
			<Grid
				container
				justifyContent='center'
				textAlign='center'
				pt={2}
				columnSpacing={1}
				rowSpacing={3}>
				{props.playerCurrency.map((cur) => (
					<Grid item key={cur.id} xs={6} md={4}>
						<PlayerCurrencyField {...cur} />
					</Grid>
				))}
			</Grid>
			<Divider sx={{ mt: 2, mb: 1 }} />
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding='none'></TableCell>
							<TableCell padding='none'></TableCell>
							<TableCell align='center'>{t('sheet.table.name')}</TableCell>
							<TableCell align='center'>{t('sheet.table.description')}</TableCell>
							<TableCell align='center'>{t('sheet.table.weight')}</TableCell>
							<TableCell align='center'>{t('sheet.table.quantity')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{playerItems.map((item) => (
							<PlayerItemField
								key={item.id}
								{...item}
								onDelete={() => onDeleteItem(item.id)}
								onQuantityChange={(quantity) => {
									props.onItemChange(item, { ...item, quantity });
									setPlayerItems((items) =>
										items.map((it) => {
											if (it.id === item.id) return { ...it, quantity };
											return it;
										})
									);
								}}
								onTrade={() => onTrade(item.id)}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<PartialBackdrop open={loading} sx={{ flexDirection: 'column', gap: 3 }}>
				<CircularProgress color='inherit' disableShrink />
				{tradeId && (
					<Button variant='contained' onClick={onTradeCancel}>
						TODO: Cancel Trade
					</Button>
				)}
			</PartialBackdrop>
		</SheetContainer>
	);
};

type PlayerCurrencyFieldProps = {
	id: number;
	name: string;
	value: string;
};

const PlayerCurrencyField: React.FC<PlayerCurrencyFieldProps> = (props) => {
	const [value, setValue, isValueClean] = useExtendedState(props.value);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const onValueBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
		if (isValueClean()) return;
		api
			.post<PlayerItemApiResponse>('/sheet/player/currency', { id: props.id, value })
			.then((res) => {
				if (res.data.status === 'failure') handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<TextField
			id={`playerCurrency${props.id}`}
			label={props.name}
			autoComplete='off'
			size='small'
			value={value}
			onChange={(ev) => setValue(ev.target.value)}
			onBlur={onValueBlur}
		/>
	);
};

const PlayerMaxLoadField: React.FC<{
	playerCurrentLoad: number;
	playerMaxLoad: number;
}> = (props) => {
	const [maxLoad, setMaxLoad, isMaxLoadClean] = useExtendedState(props.playerMaxLoad);
	const api = useContext(ApiContext);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onMaxLoadBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
		if (isMaxLoadClean()) return;
		api
			.post<PlayerApiResponse>('/sheet/player', { maxLoad })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const overload = props.playerCurrentLoad > maxLoad;

	return (
		<TextField
			variant='outlined'
			label={t('load')}
			autoComplete='off'
			color={overload ? 'error' : undefined}
			focused={overload || undefined}
			InputProps={{
				startAdornment: (
					<Typography variant='body1' color='GrayText'>
						{props.playerCurrentLoad}/
					</Typography>
				),
			}}
			inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
			value={maxLoad}
			onChange={(ev) => {
				if (ev.target.validity.valid) setMaxLoad(parseInt(ev.target.value) || 0);
			}}
			onBlur={onMaxLoadBlur}
		/>
	);
};

type PlayerItemFieldProps = {
	id: number;
	name: string;
	currentDescription: string;
	quantity: number;
	weight: number;
	onDelete: () => void;
	onQuantityChange: (quantity: number) => void;
	onTrade: () => void;
};

const PlayerItemField: React.FC<PlayerItemFieldProps> = (props) => {
	const [quantity, setQuantity, isQuantityClean] = useExtendedState(props.quantity);
	const [currentDescription, setCurrentDescription, isDescriptionClean] = useExtendedState(
		props.currentDescription
	);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const quantityChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const aux = ev.currentTarget.value;
		let newQuantity = parseInt(aux);

		if (aux.length === 0) newQuantity = 0;
		else if (isNaN(newQuantity)) return;

		setQuantity(newQuantity);
	};

	const quantityBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		let newQuantity = quantity;
		if (newQuantity < 0) {
			newQuantity = 0;
			setQuantity(newQuantity);
		}

		if (isQuantityClean()) return;

		api
			.post<PlayerItemApiResponse>('/sheet/player/item', {
				id: props.id,
				quantity: newQuantity,
			})
			.then((res) => {
				if (res.data.status === 'success') return props.onQuantityChange(quantity);
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const descriptionBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isDescriptionClean()) return;
		api
			.post<PlayerItemApiResponse>('/sheet/player/item', { id: props.id, currentDescription })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
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
			<TableCell align='center'>
				<TextField
					multiline
					maxRows={4}
					size='small'
					value={currentDescription}
					onChange={(ev) => setCurrentDescription(ev.target.value)}
					onBlur={descriptionBlur}
					style={{ minWidth: '20em' }}
					inputProps={{
						'aria-label': 'Description',
					}}
				/>
			</TableCell>
			<TableCell align='center'>{props.weight || '-'}</TableCell>
			<TableCell align='center'>
				<TextField
					variant='standard'
					value={quantity}
					onChange={quantityChange}
					onBlur={quantityBlur}
					inputProps={{
						style: { textAlign: 'center' },
						'aria-label': 'Quantity',
					}}
					style={{ width: '3rem' }}
				/>
			</TableCell>
		</TableRow>
	);
};

export default PlayerItemContainer;
