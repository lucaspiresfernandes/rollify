import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import type { Trade } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { ApiContext, LoggerContext } from '../../contexts';
import type { Locale } from '../../i18n';
import type { PlayerCombatContainerProps } from './PlayerCombatContainer';
import type { PlayerItemContainerProps } from './PlayerItemContainer';
import PlayerCombatContainer from './PlayerCombatContainer';
import PlayerItemContainer from './PlayerItemContainer';
import useExtendedState from '../../hooks/useExtendedState';
import type { PlayerApiResponse } from '../../pages/api/sheet/player';
import { handleDefaultApiResponse } from '../../utils';

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
			<Grid item xs={12} my={2}>
				<Divider />
				<Box
					display='flex'
					flexDirection='row'
					alignItems='center'
					justifyContent='center'
					textAlign='center'
					my={2}>
					<Typography variant='h4' component='span' mr={1}>
						TODO: Player Load:
					</Typography>
					<PlayerMaxLoadField playerCurrentLoad={currentLoad} playerMaxLoad={props.playerMaxLoad} />
				</Box>
				<Divider />
			</Grid>

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
				/>
			</Grid>
		</>
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

	const loadColor = props.playerCurrentLoad > maxLoad ? 'red' : undefined;

	const onMaxLoadBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
		if (isMaxLoadClean()) return;
		api
			.post<PlayerApiResponse>('/sheet/player', { maxLoad })
			.then((res) => handleDefaultApiResponse(res, log, t))
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	return (
		<Typography variant='h4' component='span'>
			{props.playerCurrentLoad} /
			<TextField
				variant='standard'
				value={maxLoad}
				onChange={(ev) => setMaxLoad(parseInt(ev.target.value) || 0)}
				onBlur={onMaxLoadBlur}
				InputProps={{ sx: { color: loadColor } }}
				inputProps={{ style: { textAlign: 'center' } }}
				sx={{ width: '2em' }}
			/>
		</Typography>
	);
};

export default PlayerLoadContainer;
