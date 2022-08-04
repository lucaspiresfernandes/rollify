import Grid from '@mui/material/Grid';
import type { Trade } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useState } from 'react';
import type { Locale } from '../../i18n';
import type { PlayerCombatContainerProps } from './PlayerCombatContainer';
import PlayerCombatContainer from './PlayerCombatContainer';
import type { PlayerItemContainerProps } from './PlayerItemContainer';
import PlayerItemContainer from './PlayerItemContainer';

type CombatProps = Pick<PlayerCombatContainerProps, 'playerArmor' | 'playerWeapons'>;
type ItemProps = Pick<PlayerItemContainerProps, 'playerItems' | 'playerCurrency'>;

type PlayerLoadContainerProps = CombatProps &
	ItemProps & {
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
	const { t } = useI18n<Locale>();

	return (
		<>
			<Grid item xs={12}>
				<PlayerCombatContainer
					title={t('sheet.playerCombatTitle')}
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
					title={t('sheet.playerItemTitle')}
					playerCurrency={props.playerCurrency}
					playerItems={props.playerItems}
					senderTrade={props.senderTrade}
					receiverTrade={props.receiverTrade}
					onItemAdd={(item) => setCurrentLoad((w) => w + item.weight * item.quantity)}
					onItemRemove={(item) => {
						console.log(item);
						setCurrentLoad((w) => w - item.weight * item.quantity);
					}}
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
