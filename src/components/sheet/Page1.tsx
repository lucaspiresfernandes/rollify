import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import Router from 'next/router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
	AddDataContext,
	ApiContext,
	DiceRollContext,
	DiceRollEvent,
	SocketContext,
} from '../../contexts';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import type { SheetFirstPageProps } from '../../pages/sheet/player/1';
import createApiClient from '../../utils/createApiClient';
import DiceRollDialog, { DiceRoll } from '../DiceRollDialog';
import LoadingScreen from '../LoadingScreen';
import AddDataDialog, { AddDataDialogProps } from './dialogs/AddDataDialog';
import PlayerAttributeContainer from './PlayerAttributeContainer';
import PlayerCharacteristicContainer from './PlayerCharacteristicContainer';
import PlayerCombatContainer from './PlayerCombatContainer';
import PlayerInfoContainer from './PlayerInfoContainer';
import PlayerItemContainer from './PlayerItemContainer';
import PlayerSkillContainer from './PlayerSkillContainer';
import PlayerSpellContainer from './PlayerSpellContainer';

const MemoPlayerAttributeContainer = memo(PlayerAttributeContainer, () => true);
const MemoPlayerCharacteristicContainer = memo(PlayerCharacteristicContainer, () => true);
const MemoPlayerCombatContainer = memo(PlayerCombatContainer, () => true);
const MemoPlayerInfoContainer = memo(PlayerInfoContainer, () => true);
const MemoPlayerItemContainer = memo(PlayerItemContainer, () => true);
const MemoPlayerSkillContainer = memo(PlayerSkillContainer, () => true);
const MemoPlayerSpellContainer = memo(PlayerSpellContainer, () => true);

const PlayerSheetPage1: React.FC<SheetFirstPageProps & { isNpc?: boolean }> = (props) => {
	const [addDataDialogOpen, setAddDataDialogOpen] = useState(false);
	const [dialogData, setDialogData] = useState<{
		data: { id: number; name: string }[];
		onSubmit: AddDataDialogProps['onSubmit'];
	}>({ data: [], onSubmit: () => {} });
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
		socket.on('playerDelete', () => api.delete('/player').then(() => Router.push('/')));
		return () => {
			socket.off('playerDelete');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	const onRollDice: DiceRollEvent = useCallback(
		(dice, onResult) => setDiceRoll({ dice, onResult }),
		[]
	);

	const addDataProvider = useMemo(
		() => ({
			openDialog: (data: typeof dialogData['data'], onSubmit: typeof dialogData['onSubmit']) => {
				setDialogData({ data, onSubmit });
				setAddDataDialogOpen(true);
			},
			closeDialog: () => setAddDataDialogOpen(false),
		}),
		[]
	);

	if (!socket) return <LoadingScreen />;

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
							playerName={props.player.name}
							playerNameShow={props.player.showName}
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
								attributeDiceConfig={props.diceConfig.attribute}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<MemoPlayerCharacteristicContainer
								title={t('sheet.playerCharacteristicTitle')}
								playerCharacteristics={props.player.PlayerCharacteristic.map((char) => ({
									...char,
									...char.Characteristic,
								}))}
								characteristicDiceConfig={props.diceConfig.characteristic}
							/>
						</Grid>

						<AddDataContext.Provider value={addDataProvider}>
							<SocketContext.Provider value={socket}>
								<Grid item xs={12} sm={6}>
									<MemoPlayerSkillContainer
										title={t('sheet.playerSkillTitle')}
										playerSkills={props.player.PlayerSkill.map((skill) => ({
											...skill,
											...skill.Skill,
											specializationName: skill.Skill.Specialization?.name || null,
										}))}
										automaticMarking={props.automaticMarking}
										skillDiceConfig={props.diceConfig.skill}
									/>
								</Grid>

								<Grid item xs={12}>
									<MemoPlayerCombatContainer
										title={t('sheet.playerCombatTitle')}
										playerEquipments={props.player.PlayerEquipment}
									/>
								</Grid>

								<Grid item xs={12}>
									<MemoPlayerItemContainer
										title={t('sheet.playerItemTitle')}
										playerCurrency={props.player.PlayerCurrency.map((cur) => ({
											id: cur.Currency.id,
											name: cur.Currency.name,
											value: cur.value,
										}))}
										playerItems={props.player.PlayerItem.map((it) => ({
											...it,
											...it.Item,
										}))}
										maxLoad={props.player.maxLoad}
									/>
								</Grid>
							</SocketContext.Provider>

							<Grid item xs={12}>
								<MemoPlayerSpellContainer
									title={t('sheet.playerSpellTitle')}
									playerSpells={props.player.PlayerSpell.map((sp) => sp.Spell)}
								/>
							</Grid>
						</AddDataContext.Provider>
					</DiceRollContext.Provider>
					<DiceRollDialog onClose={() => setDiceRoll({ dice: null })} {...diceRoll} />
				</ApiContext.Provider>
			</Grid>
			<AddDataDialog
				open={addDataDialogOpen}
				data={dialogData.data}
				onClose={() => setAddDataDialogOpen(false)}
				onSubmit={dialogData.onSubmit}
			/>
		</Container>
	);
};

export default PlayerSheetPage1;
