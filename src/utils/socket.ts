import type {
	Item,
	PlayerItem,
	Spell,
	Weapon,
	PlayerWeapon,
	PlayerArmor,
	Armor,
} from '@prisma/client';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiResponse } from 'next';
import type { Server as SocketIOServer } from 'socket.io';
// import type { TradeType } from '../components/Modals/PlayerTradeModal';
import type { DiceRequest, DiceResponse } from './dice';
import type { Environment } from './portrait';

type TradeType = 'weapon' | 'armor' | 'item';

type ArmorTradeObject = {
	type: Extract<TradeType, 'armor'>;
	obj: PlayerArmor & { Armor: Armor };
};

type WeaponTradeObject = {
	type: Extract<TradeType, 'weapon'>;
	obj: PlayerWeapon & { Weapon: Weapon };
};

type ItemTradeObject = {
	type: Extract<TradeType, 'item'>;
	obj: PlayerItem & { Item: Item };
};

type TradeObject = WeaponTradeObject | ItemTradeObject | ArmorTradeObject;

export interface ServerToClientEvents {
	//---------- Player-triggered Events ----------
	playerNameChange: (playerId: number, value: string) => void;
	playerNameShowChange: (playerId: number, show: boolean) => void;
	playerAttributeStatusChange: (playerId: number, attStatusId: number, value: boolean) => void;
	playerInfoChange: (playerId: number, infoId: number, value: string) => void;
	playerAttributeChange: (
		playerId: number,
		attributeId: number,
		value: number,
		maxValue: number,
		show: boolean
	) => void;
	playerSpecChange: (playerId: number, specId: number, value: string) => void;
	playerCurrencyChange: (playerId: number, currencyId: number, value: string) => void;
	playerCharacteristicChange: (
		playerId: number,
		characteristicId: number,
		value: number,
		modifier: number
	) => void;
	playerSkillChange: (playerId: number, skillId: number, value: number, modifier: number) => void;
	playerWeaponAdd: (playerId: number, weapon: Weapon) => void;
	playerWeaponRemove: (playerId: number, id: number) => void;
	playerArmorAdd: (playerId: number, armor: Armor) => void;
	playerArmorRemove: (playerId: number, id: number) => void;
	playerItemAdd: (
		playerId: number,
		item: Item,
		currentDescription: string,
		quantity: number
	) => void;
	playerItemRemove: (playerId: number, id: number) => void;
	playerItemChange: (
		playerId: number,
		itemID: number,
		currentDescription: string,
		quantity: number
	) => void;
	playerSpellAdd: (playerId: number, spell: Spell) => void;
	playerSpellRemove: (playerId: number, spellId: number) => void;
	playerMaxLoadChange: (playerId: number, newLoad: number) => void;
	playerSpellSlotsChange: (playerId: number, newSpellSlots: number) => void;
	playerTradeRequest: (
		type: TradeType,
		tradeId: number,
		receiverObjectId: number | null,
		senderName: string,
		senderObjectName: string
	) => void;
	playerTradeResponse: (accept: boolean, object?: TradeObject) => void;

	//---------- Admin-triggered Events ----------
	environmentChange: (newValue: Environment) => void;
	playerDelete: () => void;

	//---------- Dice-triggered Events ----------
	diceRoll: () => void;
	diceResult: (playerId: number, results: DiceResponse[], dices: DiceRequest) => void;
}

export interface ClientToServerEvents {
	roomJoin: (room: string) => void;
}

export type NextApiResponseServerIO<T = any> = NextApiResponse<T> & {
	socket: NetSocket & {
		server: HTTPServer & {
			io: SocketIOServer<ServerToClientEvents>;
		};
	};
};
