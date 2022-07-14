import type { AlertColor } from '@mui/material';
import { createContext } from 'react';
import type { SocketIO } from '../hooks/useSocket';

export type LoggerProps = {
	severity?: AlertColor;
	text: string;
};

export const Logger = createContext<(props: LoggerProps) => unknown>(() => {});
export const Socket = createContext<SocketIO>(undefined as any);
