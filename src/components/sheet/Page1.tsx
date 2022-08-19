import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import Router from 'next/router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
	AddDataContextType,
	AddDataDialogContext,
	ApiContext,
	DiceRollContext,
	DiceRollEvent,
	SocketContext,
	TradeContextType,
	TradeDialogContext,
} from '../../contexts';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import type { SheetFirstPageProps } from '../../pages/sheet/player/1';
import createApiClient from '../../utils/createApiClient';
import DiceRollDialog, { DiceRoll } from '../DiceRollDialog';
import AddDataDialog, { AddDataDialogProps } from './dialogs/AddDataDialog';
import PlayerTradeDialog, { PlayerTradeDialogProps } from './dialogs/PlayerTradeDialog';
import PlayerAttributeContainer from './PlayerAttributeContainer';
import PlayerCharacteristicContainer from './PlayerCharacteristicContainer';
import PlayerInfoContainer from './PlayerInfoContainer';
import PlayerLoadContainer from './PlayerLoadContainer';
import PlayerSkillContainer from './PlayerSkillContainer';
import PlayerSpellContainer from './PlayerSpellContainer';

const MemoPlayerInfoContainer = memo(PlayerInfoContainer, () => true);
const MemoPlayerAttributeContainer = memo(PlayerAttributeContainer, () => true);
const MemoPlayerCharacteristicContainer = memo(PlayerCharacteristicContainer, () => true);
const MemoPlayerSkillContainer = memo(PlayerSkillContainer, () => true);
const MemoPlayerSpellContainer = memo(PlayerSpellContainer, () => true);
const MemoPlayerLoadContainer = memo(PlayerLoadContainer, () => true);

const PlayerSheetPage1: React.FC<SheetFirstPageProps & { isNpc: boolean }> = (props) => {
	const [addDataDialogOpen, setAddDataDialogOpen] = useState(false);
	const [addDialogData, setAddDialogData] = useState<{
		data: AddDataDialogProps['data'];
		onSubmit: AddDataDialogProps['onSubmit'];
	}>({ data: [], onSubmit: () => {} });

	const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
	const [tradeDialogData, setTradeDialogData] = useState<{
		type: PlayerTradeDialogProps['type'];
		offerId: PlayerTradeDialogProps['offerId'];
		partners: PlayerTradeDialogProps['partners'];
		currentItems: PlayerTradeDialogProps['currentItems'];
		onSubmit: PlayerTradeDialogProps['onSubmit'];
	}>({
		type: 'armor',
		offerId: 0,
		partners: [],
		currentItems: [],
		onSubmit: () => {},
	});

	const [diceRoll, setDiceRoll] = useState<DiceRoll>({ dice: null });

	const socket = useSocket(`player${props.player.id}`);
	const { t } = useI18n<Locale>();

	const api = useMemo(
		() =>
			createApiClient({
				transformRequest: [
					(data) => {
						if (props.isNpc) data = { ...data, npcId: props.player.id };
						return data;
					},
				],
			}),
		[props.isNpc, props.player.id]
	);

	useEffect(() => {
		if (!socket) return;
		socket.on('playerDelete', () => Router.push('/'));
		return () => {
			socket.off('playerDelete');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	const onRollDice: DiceRollEvent = useCallback(
		(dice, onResult) => setDiceRoll({ dice, onResult }),
		[]
	);

	const addDataProvider: AddDataContextType = useMemo(
		() => ({
			openDialog: (data, onSubmit) => {
				setAddDialogData({ data, onSubmit });
				setAddDataDialogOpen(true);
			},
			closeDialog: () => setAddDataDialogOpen(false),
		}),
		[]
	);

	const tradeProvider: TradeContextType = useMemo(
		() => ({
			openRequest: (tradeRequest) => {
				setTradeDialogData((data) => ({ ...data, tradeRequest }));
				setTradeDialogOpen(true);
			},
			openDialog: (type, offerId, partners, currentItems, onSubmit) => {
				setTradeDialogData({ type, offerId, partners, currentItems, onSubmit });
				setTradeDialogOpen(true);
			},
			closeDialog: () => setTradeDialogOpen(false),
		}),
		[]
	);

	return (
		<Container sx={{ mt: 2 }}>
			<Box textAlign='center'>
				<Typography variant='h3' component='h1'>
					{t('sheet.playerTitle')}
				</Typography>
			</Box>
			<Grid container spacing={2} my={2}>
				<ApiContext.Provider value={api}>
					<Grid item xs={12} sm={6}>
						<MemoPlayerInfoContainer
							title={t('sheet.playerInfoTitle')}
							playerName={{
								value: props.player.name,
								show: props.player.showName,
							}}
							playerInfo={props.player.PlayerInfo.map((info) => ({
								...info,
								...info.Info,
							}))}
							playerSpec={props.player.PlayerSpec.map((spec) => ({
								id: spec.Spec.id,
								name: spec.Spec.name,
								value: spec.value,
							}))}
						/>
					</Grid>

					<DiceRollContext.Provider value={onRollDice}>
						<Grid item xs={12} sm={6}>
							<MemoPlayerAttributeContainer
								playerAttributes={props.player.PlayerAttributes.map((attr) => ({
									...attr,
									...attr.Attribute,
								}))}
								playerAttributeStatus={props.player.PlayerAttributeStatus.map((attr) => ({
									value: attr.value,
									...attr.AttributeStatus,
									attributeId: attr.AttributeStatus.attribute_id,
								}))}
								playerAvatars={props.player.PlayerAvatar.map((avatar) => ({
									attributeStatus: avatar.AttributeStatus,
									link: avatar.link,
								}))}
								baseDice={props.diceConfig.baseDice}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<MemoPlayerCharacteristicContainer
								title={t('sheet.playerCharacteristicTitle')}
								playerCharacteristics={props.player.PlayerCharacteristic.map((char) => ({
									...char,
									...char.Characteristic,
								}))}
								enableModifiers={props.diceConfig.characteristic.enableModifiers}
							/>
						</Grid>

						<MemoPlayerSkillContainer
							title={t('sheet.playerSkillTitle')}
							playerSkills={props.player.PlayerSkill.map((skill) => ({
								...skill,
								...skill.Skill,
							}))}
							enableModifiers={props.diceConfig.skill.enableModifiers}
						/>

						<AddDataDialogContext.Provider value={addDataProvider}>
							<TradeDialogContext.Provider value={tradeProvider}>
								<SocketContext.Provider value={socket}>
									<MemoPlayerLoadContainer
										playerMaxLoad={props.player.maxLoad}
										playerWeapons={props.player.PlayerWeapon.map((weap) => ({
											...weap,
											...weap.Weapon,
										}))}
										playerArmor={props.player.PlayerArmor.map((arm) => arm.Armor)}
										playerCurrency={props.player.PlayerCurrency.map((cur) => ({
											id: cur.Currency.id,
											name: cur.Currency.name,
											value: cur.value,
										}))}
										playerItems={props.player.PlayerItem.map((it) => ({
											...it,
											...it.Item,
										}))}
										senderTrade={props.player.SenderTrade}
										receiverTrade={props.player.ReceiverTrade}
									/>
								</SocketContext.Provider>
							</TradeDialogContext.Provider>

							<Grid item xs={12}>
								<MemoPlayerSpellContainer
									title={t('sheet.playerSpellTitle')}
									playerSpells={props.player.PlayerSpell.map((sp) => sp.Spell)}
									playerMaxSlots={props.player.spellSlots}
								/>
							</Grid>
						</AddDataDialogContext.Provider>
					</DiceRollContext.Provider>
					<DiceRollDialog onClose={() => setDiceRoll({ dice: null })} {...diceRoll} />
				</ApiContext.Provider>
			</Grid>
			<AddDataDialog
				open={addDataDialogOpen}
				onClose={() => setAddDataDialogOpen(false)}
				{...addDialogData}
			/>
			<PlayerTradeDialog
				open={tradeDialogOpen}
				onClose={() => setTradeDialogOpen(false)}
				{...tradeDialogData}
			/>
		</Container>
	);
};

export default PlayerSheetPage1;
