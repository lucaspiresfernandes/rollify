import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import type { Locale } from '../../../i18n';
import type { PlayerApiResponsePlayerData } from '../../../pages/api/sheet/player';

export type DetailsProps = {
	details: NonNullable<PlayerApiResponsePlayerData>;
};

const Details: React.FC<DetailsProps> = ({ details }) => {
	const { t } = useI18n<Locale>();

	const load = details.PlayerItem.reduce((acc, item) => acc + item.Item.weight * item.quantity, 0);
	const slots = details.PlayerSpell.reduce((acc, sp) => acc + sp.Spell.slots, 0);

	return (
		<Box textAlign='center' my={2}>
			<Typography variant='h5' gutterBottom>
				{t('sheet.playerInfoTitle')}
			</Typography>
			<Box
				display='flex'
				flexDirection='row'
				gap={3}
				flexWrap='wrap'
				justifyContent='center'
				mb={3}>
				{details.PlayerInfo.map((info) => (
					<div key={info.Info.id}>
						<Typography variant='h6'>{info.value || '?'}</Typography>
						<Typography variant='caption'>{info.Info.name}</Typography>
					</div>
				))}
			</Box>

			<Box display='flex' flexDirection='row' gap={3} flexWrap='wrap' justifyContent='center'>
				{details.PlayerSpec.map((spec) => (
					<div key={spec.Spec.id}>
						<Typography variant='h6'>{spec.value || '?'}</Typography>
						<Typography variant='caption'>{spec.Spec.name}</Typography>
					</div>
				))}
			</Box>

			<Divider sx={{ my: 2 }} />

			<Typography variant='h5' gutterBottom>
				{t('sheet.playerCharacteristicTitle')}
			</Typography>
			<Box display='flex' flexDirection='row' gap={3} flexWrap='wrap' justifyContent='center'>
				{details.PlayerCharacteristic.map((char) => (
					<div key={char.Characteristic.id}>
						<Typography variant='h6'>
							{char.value || '0'}
							{char.modifier ? `+ ${char.modifier}` : ''}
						</Typography>
						<Typography variant='caption'>{char.Characteristic.name}</Typography>
					</div>
				))}
			</Box>

			{details.PlayerSkill.length > 0 && (
				<>
					<Divider sx={{ my: 2 }} />

					<Typography variant='h5' gutterBottom>
						{t('sheet.playerSkillTitle')}
					</Typography>
					<Box display='flex' flexDirection='row' gap={3} flexWrap='wrap' justifyContent='center'>
						{details.PlayerSkill.map((skill) => (
							<div key={skill.Skill.id}>
								<Typography variant='h6'>
									{skill.value || '0'}
									{skill.modifier ? `+ ${skill.modifier}` : ''}
								</Typography>
								<Typography variant='caption'>{skill.Skill.name}</Typography>
							</div>
						))}
					</Box>
				</>
			)}

			<Divider sx={{ my: 2 }} />

			<Typography variant='h5'>{t('sheet.playerItemTitle')}</Typography>
			<Typography variant='body2' mb={2}>
				{t('currentWeight')}:{' '}
				<span style={{ color: load > details.maxLoad ? 'red' : undefined }}>
					{load} / {details.maxLoad}
				</span>
			</Typography>

			<Box
				display='flex'
				flexDirection='row'
				gap={3}
				flexWrap='wrap'
				justifyContent='center'
				mb={3}>
				{details.PlayerCurrency.map((cur) => (
					<div key={cur.Currency.id}>
						<Typography variant='h6'>{cur.value || '0'}</Typography>
						<Typography variant='caption'>{cur.Currency.name}</Typography>
					</div>
				))}
			</Box>

			{details.PlayerItem.length > 0 && (
				<Box display='flex' flexDirection='column' flexWrap='wrap' justifyContent='center'>
					{details.PlayerItem.map((item) => {
						const title =
							item.currentDescription +
							' ' +
							`(${t('sheet.table.weight')}: ${item.Item.weight})` +
							`(${t('sheet.table.quantity')}: ${item.quantity})`;

						return (
							<Tooltip key={item.Item.id} title={title} placement='top'>
								<Typography variant='h6' component='label'>
									{item.Item.name}
								</Typography>
							</Tooltip>
						);
					})}
				</Box>
			)}

			{details.PlayerWeapon.length > 0 && details.PlayerWeapon.length > 0 && (
				<>
					<Divider sx={{ my: 2 }} />
					<Typography variant='h5'>{t('sheet.playerCombatTitle')}</Typography>
				</>
			)}

			{details.PlayerWeapon.length > 0 && (
				<>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell align='center'>{t('sheet.table.name')}</TableCell>
									<TableCell align='center'>{t('sheet.table.type')}</TableCell>
									<TableCell align='center'>{t('sheet.table.damage')}</TableCell>
									<TableCell align='center'>{t('sheet.table.range')}</TableCell>
									<TableCell align='center'>{t('sheet.table.attacks')}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{details.PlayerWeapon.map((weapon) => (
									<TableRow key={weapon.Weapon.id}>
										<TableCell align='center'>{weapon.Weapon.name}</TableCell>
										<TableCell align='center'>{weapon.Weapon.type}</TableCell>
										<TableCell align='center'>{weapon.Weapon.damage}</TableCell>
										<TableCell align='center'>{weapon.Weapon.range}</TableCell>
										<TableCell align='center'>{weapon.Weapon.attacks}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</>
			)}

			{details.PlayerArmor.length > 0 && (
				<>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell align='center'>{t('sheet.table.name')}</TableCell>
									<TableCell align='center'>{t('sheet.table.type')}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{details.PlayerArmor.map((armor) => (
									<TableRow key={armor.Armor.id}>
										<TableCell align='center'>{armor.Armor.name}</TableCell>
										<TableCell align='center'>{armor.Armor.type}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</>
			)}

			{details.PlayerSpell.length > 0 && (
				<>
					<Divider sx={{ my: 2 }} />

					<Typography variant='h5'>{t('sheet.playerSpellTitle')}</Typography>
					<Typography variant='body2' mb={2}>
						{t('availableSlots')}:{' '}
						<span style={{ color: slots > details.spellSlots ? 'red' : undefined }}>
							{slots} / {details.spellSlots}
						</span>
					</Typography>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell align='center'>{t('sheet.table.name')}</TableCell>
									<TableCell align='center'>{t('sheet.table.type')}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{details.PlayerSpell.map((spell) => (
									<TableRow key={spell.Spell.id}>
										<TableCell align='center'>{spell.Spell.name}</TableCell>
										<TableCell align='center'>{spell.Spell.type}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</>
			)}
		</Box>
	);
};

export default Details;
