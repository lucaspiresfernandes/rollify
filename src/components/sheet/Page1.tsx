import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import Router from 'next/router';
import { useEffect } from 'react';
import { ApiContext, SocketContext } from '../../contexts';
import useSocket from '../../hooks/useSocket';
import type { Locale } from '../../i18n';
import type { SheetFirstPageProps } from '../../pages/sheet/player/1';
import createApiClient from '../../utils/createApiClient';
import SheetContainer from './Container';
import PlayerAttributeContainer from './PlayerAttributeContainer';
import PlayerCharacteristicContainer from './PlayerCharacteristicContainer';
import PlayerCombatContainer from './PlayerCombatContainer';
import PlayerInfoContainer from './PlayerInfoContainer';
import PlayerSkillContainer from './PlayerSkillContainer';

const Sheet: React.FC<SheetFirstPageProps & { isNpc: boolean }> = (props) => {
	const socket = useSocket(`player${props.player.id}`);
	const { t } = useI18n<Locale>();
	// const modeContext = useContext(PaletteModeContext);

	const api = createApiClient({
		transformRequest: [
			(data) => {
				if (props.isNpc) data.npcId = props.player.id;
				return data;
			},
		],
	});

	useEffect(() => {
		if (!socket) return;
		socket.on('playerDelete', () => api.delete('/player').then(() => Router.push('/')));
		return () => {
			socket.off('playerDelete');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	if (!socket) return null;

	return (
		<SocketContext.Provider value={socket}>
			<ApiContext.Provider value={api}>
				<Container sx={{ mt: 2 }}>
					<Box textAlign='center'>
						<Typography variant='h3' component='h1'>
							{t('sheet.playerTitle')}
						</Typography>
						{/* <Switch
							aria-label='Switch Theme'
							checked={modeContext.mode === 'dark'}
							onChange={modeContext.toggleMode}
						/> */}
					</Box>
					<Grid container spacing={1}>
						<Grid item xs={12} sm={6}>
							<PlayerInfoContainer
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

						<Grid item xs={12} sm={6}>
							<PlayerAttributeContainer
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
							<PlayerCharacteristicContainer
								title={t('sheet.playerCharacteristicTitle')}
								playerCharacteristics={props.player.PlayerCharacteristic.map((char) => ({
									...char,
									...char.Characteristic,
								}))}
								characteristicDiceConfig={props.diceConfig.characteristic}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<PlayerSkillContainer
								title={t('sheet.playerSkillTitle')}
								playerSkills={props.player.PlayerSkill.map((skill) => ({
									...skill,
									...skill.Skill,
									specializationName: skill.Skill.Specialization?.name || null,
								}))}
								availableSkills={props.availableSkills.map((skill) => ({
									...skill,
									specializationName: skill.Specialization?.name || null,
								}))}
								skillDiceConfig={props.diceConfig.skill}
							/>
						</Grid>

						{/* Combate */}
						<Grid item xs={12}>
							<PlayerCombatContainer
								title={t('sheet.playerCombatTitle')}
								playerEquipments={props.player.PlayerEquipment}
								availableEquipments={props.availableEquipments}
								partners={props.partners}
							/>
						</Grid>

						{/* Itens */}
						<Grid item xs={12}>
							<SheetContainer title='Itens'></SheetContainer>
						</Grid>

						{/* Magias */}
						<Grid item xs={12}>
							<SheetContainer title='Magias'></SheetContainer>
						</Grid>
					</Grid>
				</Container>
			</ApiContext.Provider>
		</SocketContext.Provider>
	);
};

export default Sheet;
