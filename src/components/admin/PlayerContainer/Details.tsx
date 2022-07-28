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
		<Box>
			<Divider sx={{ my: 2 }} />
			<Box>
				<Box
					display='flex'
					flexDirection='row'
					gap={3}
					flexWrap='wrap'
					justifyContent='center'
					textAlign='center'>
					{details.PlayerInfo.map((info) => (
						<Box key={info.Info.id} display='flex' flexDirection='column'>
							<Typography variant='h6'>{info.value}</Typography>
							<Typography variant='caption'>{info.Info.name}</Typography>
						</Box>
					))}
				</Box>
				<Divider sx={{ my: 2 }} />
				<Box
					display='flex'
					flexDirection='row'
					gap={3}
					flexWrap='wrap'
					justifyContent='center'
					textAlign='center'>
					{details.PlayerSpec.map((spec) => (
						<Box key={spec.Spec.id} display='flex' flexDirection='column'>
							<Typography variant='h6'>{spec.value || '0'}</Typography>
							<Typography variant='caption'>{spec.Spec.name}</Typography>
						</Box>
					))}
				</Box>
				<Divider sx={{ my: 2 }} />
				<Box
					display='flex'
					flexDirection='row'
					gap={3}
					flexWrap='wrap'
					justifyContent='center'
					textAlign='center'>
					{details.PlayerCharacteristic.map((char) => (
						<Box key={char.Characteristic.id} display='flex' flexDirection='column'>
							<Typography variant='h6'>
								{char.value || '0'}
								{char.modifier ? `+ ${char.modifier}` : ''}
							</Typography>
							<Typography variant='caption'>{char.Characteristic.name}</Typography>
						</Box>
					))}
				</Box>
				<Divider sx={{ my: 2 }} />
				<Box
					display='flex'
					flexDirection='row'
					gap={3}
					flexWrap='wrap'
					justifyContent='center'
					textAlign='center'>
					{details.PlayerSkill.filter((sk) => sk.favourite).map((skill) => (
						<Box key={skill.Skill.id} display='flex' flexDirection='column'>
							<Typography variant='h6'>
								{skill.value || '0'}
								{skill.modifier ? `+ ${skill.modifier}` : ''}
							</Typography>
							<Typography variant='caption'>{skill.Skill.name}</Typography>
						</Box>
					))}
				</Box>
				<Divider sx={{ my: 2 }} />
				<Typography variant='h5' textAlign='center'>
					Itens
				</Typography>
				<Typography variant='body2' textAlign='center' mb={2}>
					TODO: Peso Atual:{' '}
					<span style={{ color: load > details.maxLoad ? 'red' : undefined }}>
						{load} / {details.maxLoad}
					</span>
				</Typography>
				<Box
					display='flex'
					flexDirection='column'
					flexWrap='wrap'
					justifyContent='center'
					textAlign='center'>
					{details.PlayerItem.map((item) => (
						<Tooltip
							key={item.Item.id}
							title={`${item.currentDescription} (${t('weight')}: ${item.Item.weight}) (${t(
								'quantity'
							)}: ${item.quantity})`}
							placement='top'
							sx={{ margin: 0 }}>
							<Typography variant='h6' component='label' gutterBottom>
								{item.Item.name}
							</Typography>
						</Tooltip>
					))}
				</Box>
				<Divider sx={{ my: 2 }} />
				<Typography variant='h5' textAlign='center'>
					Equipamentos
				</Typography>
				<Box>
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
				</Box>
				<Divider sx={{ my: 2 }} />
				<Typography variant='h5' textAlign='center'>
					Magias
				</Typography>
				<Typography variant='body2' textAlign='center' mb={2}>
					TODO: Slots Disponíveis:{' '}
					<span style={{ color: slots > details.spellSlots ? 'red' : undefined }}>
						{slots} / {details.spellSlots}
					</span>
				</Typography>
				<Box>
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
				</Box>
			</Box>
		</Box>
	);
};

export default Details;
