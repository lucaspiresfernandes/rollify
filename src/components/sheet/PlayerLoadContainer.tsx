import Grid from '@mui/material/Grid';
import type { Trade } from '@prisma/client';
import { useState } from 'react';
import type { PlayerCombatContainerProps } from './PlayerCombatContainer';
import PlayerCombatContainer from './PlayerCombatContainer';
import type { PlayerItemContainerProps } from './PlayerItemContainer';
import PlayerItemContainer from './PlayerItemContainer';

type CombatProps = Pick<PlayerCombatContainerProps, 'playerArmor' | 'playerWeapons'>;
type ItemProps = Pick<PlayerItemContainerProps, 'playerItems' | 'playerCurrency'>;

type PlayerLoadContainerProps = CombatProps &
	ItemProps & {
		combatTitle: string;
		itemTitle: string;
		senderTrade: Trade | null;
		receiverTrade: Trade | null;
		playerMaxLoad: number;
	};

const PlayerLoadContainer: React.FC<PlayerLoadContainerProps> = (props) => {
	const [currentLoad, setCurrentLoad] = useState(() => {
		const armorWeight = props.playerArmor.reduce((prev, cur) => prev + cur.weight, 0);
		const weaponWeight = props.playerWeapons.reduce((prev, cur) => prev + cur.weight, 0);
		const itemWeight = props.playerItems.reduce((prev, cur) => prev + cur.weight * cur.quantity, 0);
		return armorWeight + weaponWeight + itemWeight;
	});

	return (
		<>
			<Grid item xs={12}>
				<PlayerCombatContainer
					title={props.combatTitle}
					playerWeapons={props.playerWeapons}
					playerArmor={props.playerArmor}
					senderTrade={props.senderTrade}
					receiverTrade={props.receiverTrade}
					onEquipmentAdd={(eq) => setCurrentLoad((w) => w + eq.weight)}
					onEquipmentRemove={(eq) => setCurrentLoad((w) => w - eq.weight)}
				/>
			</Grid>

			<Grid item xs={12}>
				<PlayerItemContainer
					title={props.itemTitle}
					playerCurrency={props.playerCurrency}
					playerItems={props.playerItems}
					senderTrade={props.senderTrade}
					receiverTrade={props.receiverTrade}
					onItemAdd={(item) => setCurrentLoad((w) => w + item.weight * item.quantity)}
					onItemRemove={(item) => setCurrentLoad((w) => w - item.weight * item.quantity)}
					onItemChange={(oldItem, newItem) => {
						setCurrentLoad(
							(w) => w + (newItem.weight * newItem.quantity - oldItem.weight * oldItem.quantity)
						);
					}}
					playerCurrentLoad={currentLoad}
					playerMaxLoad={props.playerMaxLoad}
				/>
			</Grid>
		</>
	);
};

export default PlayerLoadContainer;
