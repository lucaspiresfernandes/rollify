import type { AlertColor, PaletteMode } from '@mui/material';
import type { AxiosInstance } from 'axios';
import { createContext } from 'react';
import type { SocketIO } from '../hooks/useSocket';

export type LoggerContextType = (props: LoggerProps) => void;
export type LoggerProps = {
	severity?: AlertColor;
	text: string;
};

export const PaletteModeContext = createContext<{ mode: PaletteMode; toggleMode: () => void }>({
	mode: 'dark',
	toggleMode: () => {},
});
export const LoggerContext = createContext<LoggerContextType>(() => {});
export const SocketContext = createContext<SocketIO>(undefined as any);
export const ApiContext = createContext<AxiosInstance>(undefined as any);