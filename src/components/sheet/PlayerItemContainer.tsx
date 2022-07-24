import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import SheetContainer from './Section';
import { AddDataContext, ApiContext, LoggerContext } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import type { Locale } from '../../i18n';
import type { ItemSheetApiResponse } from '../../pages/api/sheet/item';
import type { PlayerItemApiResponse } from '../../pages/api/sheet/player/item';
import { handleDefaultApiResponse } from '../../utils';
import PartialBackdrop from '../PartialBackdrop';

type PlayerItemContainerProps = {
	title: string;
	maxLoad: number;
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
};

// const tradeInitialValue: Trade<Item> = {
// 	type: 'item',
// 	show: false,
// 	offer: { id: 0, name: '' } as Item,
// 	donation: true,
// };

const PlayerItemContainer: React.FC<PlayerItemContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [playerItems, setPlayerItems] = useState(props.playerItems);
	// const [trade, setTrade] = useState<Trade<Item>>(tradeInitialValue);
	// const currentTradeId = useRef<number | null>(null);
	// const tradeTimeout = useRef<NodeJS.Timeout | null>(null);

	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const addDataDialog = useContext(AddDataContext);
	const { t } = useI18n<Locale>();

	const onAddItem = (id: number) => {
		addDataDialog.closeDialog();
		setLoading(true);
		api
			.put<PlayerItemApiResponse>('/sheet/player/item', { id })
			.then((res) => {
				if (res.data.status === 'success') {
					const item = res.data.item;
					return setPlayerItems([
						...playerItems,
						{
							...item,
							...item.Item,
						},
					]);
				}
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const loadAvailableItems = () => {
		setLoading(true);
		api
			.get<ItemSheetApiResponse>('/sheet/item')
			.then((res) => {
				if (res.data.status === 'success') {
					const items = res.data.item;
					addDataDialog.openDialog(items, onAddItem);
					return;
				}
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
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
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log);
				setPlayerItems((i) => i.filter((item) => item.id !== id));
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	return (
		<SheetContainer
			title={props.title}
			sx={{ position: 'relative' }}
			sideButton={
				<IconButton aria-label='Add Item' onClick={loadAvailableItems}>
					<AddIcon />
				</IconButton>
			}>
			<Divider />
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
						{playerItems.map((it) => (
							<PlayerItemField
								key={it.id}
								{...it}
								onDelete={() => onDeleteItem(it.id)}
								onQuantityChange={(quantity) => {}}
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

type PlayerCurrencyFieldProps = {};

const PlayerCurrencyField: React.FC<PlayerCurrencyFieldProps> = (props) => {
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	return <></>;
};

type PlayerLoadFieldProps = {
	maxLoad: number;
	items: {
		id: number;
		quantity: number;
		weight: number;
	}[];
};

const PlayerLoadField: React.FC<PlayerLoadFieldProps> = (props) => {
	const [currentLoad, setCurrentLoad] = useState(
		props.items.reduce((prev, cur) => prev + cur.weight * cur.quantity, 0)
	);
	const [maxLoad, setMaxLoad, isClean] = useExtendedState(props.maxLoad.toString());
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	return <></>;
};

type PlayerItemFieldProps = {
	id: number;
	name: string;
	currentDescription: string;
	quantity: number;
	weight: number;
	onDelete: () => void;
	onQuantityChange: (quantity: number) => void;
};

const PlayerItemField: React.FC<PlayerItemFieldProps> = (props) => {
	const [quantity, setQuantity, isQuantityClean] = useExtendedState(props.quantity);
	const [currentDescription, setCurrentDescription, isDescriptionClean] = useExtendedState(
		props.currentDescription
	);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	const quantityChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const aux = ev.currentTarget.value;
		let newQuantity = parseInt(aux);

		if (aux.length === 0) newQuantity = 0;
		else if (isNaN(newQuantity)) return;

		setQuantity(newQuantity);
	};

	const quantityBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isQuantityClean()) return;
		api
			.post<PlayerItemApiResponse>('/sheet/player/item', {
				id: props.id,
				quantity,
			})
			.then((res) => {
				if (res.data.status === 'success') return props.onQuantityChange(quantity);
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }));
	};

	const descriptionBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		if (isDescriptionClean()) return;
		api
			.post<PlayerItemApiResponse>('/sheet/player/item', { id: props.id, currentDescription })
			.then((res) => handleDefaultApiResponse(res, log))
			.catch((err) => log({ severity: 'error', text: err.message }));
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
				<TableCell align='center'>
					<TextField
						multiline
						maxRows={3}
						size='small'
						value={currentDescription}
						onChange={(ev) => setCurrentDescription(ev.target.value)}
						onBlur={descriptionBlur}
						inputProps={{
							'aria-label': 'Description',
						}}
					/>
				</TableCell>
				<TableCell align='center'>{props.weight}</TableCell>
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
		</>
	);
};

export default PlayerItemContainer;
