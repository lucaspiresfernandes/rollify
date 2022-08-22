import type { AlertColor } from '@mui/material';
import type { AxiosInstance } from 'axios';
import { createContext } from 'react';
import type { AddDataDialogProps } from '../components/sheet/dialogs/AddDataDialog';
import type { PlayerTradeDialogProps } from '../components/sheet/dialogs/PlayerTradeDialog';
import type { SocketIO } from '../hooks/useSocket';
import { api } from '../utils/createApiClient';
import type { DiceRequest, DiceResponse } from '../utils/dice';

export type LoggerContextType = (props: LoggerProps) => void;
export type LoggerProps = {
	severity?: AlertColor;
	text: string;
};

export type AddDataContextType = {
	openDialog: (
		data: AddDataDialogProps['data'],
		onSubmit: AddDataDialogProps['onSubmit'],
		onCreate: AddDataDialogProps['onCreate']
	) => void;
	closeDialog: () => void;
};

export type TradeContextType = {
	openRequest: (request: NonNullable<PlayerTradeDialogProps['tradeRequest']>) => void;
	openDialog: (
		type: PlayerTradeDialogProps['type'],
		offerId: PlayerTradeDialogProps['offerId'],
		partners: PlayerTradeDialogProps['partners'],
		currentItems: PlayerTradeDialogProps['currentItems'],
		onSubmit: PlayerTradeDialogProps['onSubmit']
	) => void;
	closeDialog: () => void;
};

export type DiceRollEvent = (
	dice: DiceRequest,
	onResult?: (result: DiceResponse[]) => void
) => void;

export const LoggerContext = createContext<LoggerContextType>(() => {});
export const SocketContext = createContext<SocketIO | null>(undefined as any);
export const ApiContext = createContext<AxiosInstance>(api);
export const AddDataDialogContext = createContext<AddDataContextType>({
	openDialog: () => {},
	closeDialog: () => {},
});
export const DiceRollContext = createContext<DiceRollEvent>(() => {});
export const TradeDialogContext = createContext<TradeContextType>({
	openRequest: () => {},
	openDialog: () => {},
	closeDialog: () => {},
});
