import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useState } from 'react';
import type { Locale } from '../../../i18n';
import type { PlayerApiResponsePlayerData } from '../../../pages/api/sheet/player';
import { getAvatarSize } from '../../../utils';
import PlayerAvatarImage from './PlayerAvatarImage';

export type PlayerDetailsDialogProps = {
	open: boolean;
	onClose: () => void;
	details: NonNullable<PlayerApiResponsePlayerData>;
};

const AVATAR_SIZE = getAvatarSize(1);

const PlayerDetailsDialog: React.FC<PlayerDetailsDialogProps> = ({ open, onClose, details }) => {
	const { t } = useI18n<Locale>();

	const load =
		details.PlayerItem.reduce((acc, item) => acc + item.Item.weight * item.quantity, 0) +
		details.PlayerArmor.reduce((acc, armor) => acc + armor.Armor.weight, 0) +
		details.PlayerWeapon.reduce((acc, weapon) => acc + weapon.Weapon.weight, 0);

	const slots = details.PlayerSpell.reduce((acc, sp) => acc + sp.Spell.slots, 0);

	return (
		<Dialog open={open} onClose={onClose} fullScreen>
			<DialogTitle>{t('modal.title.characterDetails')}</DialogTitle>
			<Divider />
			<DialogContent>
				<>
					<Box display='flex' flexDirection='column' alignItems='center' px={6}>
						<PlayerAvatarImage
							id={details.id}
							status={details.PlayerAttributeStatus.map((attr) => ({
								id: attr.AttributeStatus.id,
								value: attr.value,
							}))}
							width={AVATAR_SIZE[0]}
						/>
						<Typography variant='h5' mt={2} gutterBottom>
							{details.name || t('unknown')}
						</Typography>
						<Typography variant='caption'>
							{details.PlayerAttributeStatus.filter((attr) => attr.value)
								.map((attr) => attr.AttributeStatus.name)
								.join(', ')}
						</Typography>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Typography variant='h5' textAlign='center' gutterBottom>
						{t('sheet.playerInfoTitle')}
					</Typography>
					<Grid container spacing={2} textAlign='center' justifyContent='center'>
						{details.PlayerInfo.map((info) => (
							<Grid item xs={6} md={4} lg={3} xl={2} key={info.Info.id}>
								<Typography variant='h6'>{info.value || '?'}</Typography>
								<Typography variant='caption'>{info.Info.name}</Typography>
							</Grid>
						))}
						{details.PlayerSpec.map((spec) => (
							<Grid item xs={6} md={4} lg={3} xl={2} key={spec.Spec.id}>
								<Typography variant='h6'>{spec.value || '?'}</Typography>
								<Typography variant='caption'>{spec.Spec.name}</Typography>
							</Grid>
						))}
					</Grid>

					<Divider sx={{ my: 4 }} />

					<Typography variant='h5' textAlign='center' gutterBottom>
						{t('admin.editor.attribute')}
					</Typography>
					<Grid container spacing={2} textAlign='center' justifyContent='center'>
						{details.PlayerAttributes.map((attr) => (
							<Grid item xs={6} md={4} lg={3} xl={2} key={attr.Attribute.id}>
								<Typography variant='h6' color={`#${attr.Attribute.color}`}>
									{attr.value}
									<b>{attr.extraValue ? `+${attr.extraValue}` : ''}</b>/{attr.maxValue}
								</Typography>
								<Typography variant='caption'>{attr.Attribute.name}</Typography>
							</Grid>
						))}
					</Grid>

					<Divider sx={{ my: 4 }} />

					<Typography variant='h5' textAlign='center' gutterBottom>
						{t('sheet.playerCharacteristicTitle')}
					</Typography>
					<Grid container spacing={2} textAlign='center' justifyContent='center'>
						{details.PlayerCharacteristic.map((char) => {
							let modifier = '';
							if (char.modifier) {
								if (char.modifier >= 0) modifier = `+ ${char.modifier}`;
								else modifier = `- ${Math.abs(char.modifier)}`;
							}

							return (
								<Grid item xs={6} md={4} lg={3} xl={2} key={char.Characteristic.id}>
									<Typography variant='h6'>
										{char.value} {modifier}
									</Typography>
									<Typography variant='caption'>{char.Characteristic.name}</Typography>
								</Grid>
							);
						})}
					</Grid>

					{details.PlayerSkill.length > 0 && (
						<>
							<Divider sx={{ my: 4 }} />

							<Typography variant='h5' textAlign='center' gutterBottom>
								{t('sheet.playerSkillTitle')}
							</Typography>
							<Grid container spacing={2} textAlign='center' justifyContent='center'>
								{details.PlayerSkill.map((skill) => {
									let modifier = '';
									if (skill.modifier) {
										if (skill.modifier >= 0) modifier = `+ ${skill.modifier}`;
										else modifier = `- ${Math.abs(skill.modifier)}`;
									}

									return (
										<Grid item xs={6} md={4} lg={3} xl={2} key={skill.Skill.id}>
											<Typography variant='h6'>
												{skill.value} {modifier}
											</Typography>
											<Typography variant='caption'>{skill.Skill.name}</Typography>
										</Grid>
									);
								})}
							</Grid>
						</>
					)}

					{details.PlayerWeapon.length > 0 && (
						<>
							<Divider sx={{ my: 4 }} />
							<Typography variant='h5' textAlign='center'>
								{t('admin.editor.weapon')}
							</Typography>
							<TableContainer sx={{ mb: 4 }}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell align='center' padding='none' />
											<TableCell align='center'>{t('sheet.table.name')}</TableCell>
											<TableCell align='center'>{t('sheet.table.type')}</TableCell>
											<TableCell align='center'>{t('sheet.table.weight')}</TableCell>
											<TableCell align='center'>{t('sheet.table.damage')}</TableCell>
											<TableCell align='center'>{t('sheet.table.range')}</TableCell>
											<TableCell align='center'>{t('sheet.table.attacks')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{details.PlayerWeapon.map((weapon) => (
											<WeaponDetails key={weapon.Weapon.id} {...weapon} />
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}

					{details.PlayerArmor.length > 0 && (
						<>
							<Divider sx={{ my: 4 }} />
							<Typography variant='h5' textAlign='center'>
								{t('admin.editor.armor')}
							</Typography>
							<TableContainer sx={{ mb: 4 }}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell padding='none'></TableCell>
											<TableCell align='center'>{t('sheet.table.name')}</TableCell>
											<TableCell align='center'>{t('sheet.table.type')}</TableCell>
											<TableCell align='center'>{t('sheet.table.weight')}</TableCell>
											<TableCell align='center'>{t('sheet.table.damageReduction')}</TableCell>
											<TableCell align='center'>{t('sheet.table.penalty')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{details.PlayerArmor.map((armor) => (
											<ArmorDetails key={armor.Armor.id} {...armor} />
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}

					{details.PlayerItem.length > 0 && (
						<>
							<Divider sx={{ my: 4 }} />
							<Typography variant='h5' textAlign='center'>
								{t('sheet.playerItemTitle')}
							</Typography>
							<Typography variant='body2' textAlign='center' mb={2}>
								{t('currentWeight')}:{' '}
								<span style={{ color: load > details.maxLoad ? 'red' : undefined }}>
									{load} / {details.maxLoad}
								</span>
							</Typography>
							<Grid container spacing={2} textAlign='center' justifyContent='center'>
								{details.PlayerItem.map((item) => (
									<Grid item xs={6} md={4} lg={3} xl={2} key={item.Item.id}>
										<Box border='1px solid gray' borderRadius={1} p={1}>
											<Typography variant='h6'>{item.Item.name}</Typography>
											<Typography variant='body2' component='div'>
												{item.currentDescription}
											</Typography>
											<Typography variant='caption' component='div'>
												{t('sheet.table.weight')}: {item.Item.weight}
											</Typography>
											<Typography variant='caption' component='div'>
												{t('sheet.table.quantity')}: {item.quantity}
											</Typography>
										</Box>
									</Grid>
								))}
							</Grid>
						</>
					)}

					<Divider sx={{ my: 4 }} />

					<Typography variant='h5' textAlign='center' gutterBottom>
						{t('sheet.playerCurrencyTitle')}
					</Typography>
					<Grid container spacing={2} textAlign='center' justifyContent='center'>
						{details.PlayerCurrency.map((cur) => (
							<Grid item xs={6} md={4} lg={3} xl={2} key={cur.Currency.id}>
								<Typography variant='h6'>{cur.value || '0'}</Typography>
								<Typography variant='caption'>{cur.Currency.name}</Typography>
							</Grid>
						))}
					</Grid>

					{details.PlayerSpell.length > 0 && (
						<>
							<Divider sx={{ my: 4 }} />
							<Typography variant='h5' textAlign='center'>
								{t('sheet.playerSpellTitle')}
							</Typography>
							<Typography variant='body2' textAlign='center' mb={2}>
								{t('availableSlots')}:{' '}
								<span style={{ color: slots > details.spellSlots ? 'red' : undefined }}>
									{slots} / {details.spellSlots}
								</span>
							</Typography>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell padding='none' />
											<TableCell align='center'>{t('sheet.table.name')}</TableCell>
											<TableCell align='center'>{t('sheet.table.type')}</TableCell>
											<TableCell align='center'>{t('sheet.table.cost')}</TableCell>
											<TableCell align='center'>{t('sheet.table.damage')}</TableCell>
											<TableCell align='center'>{t('sheet.table.target')}</TableCell>
											<TableCell align='center'>{t('sheet.table.range')}</TableCell>
											<TableCell align='center'>{t('sheet.table.castingTime')}</TableCell>
											<TableCell align='center'>{t('sheet.table.duration')}</TableCell>
											<TableCell align='center'>{t('sheet.table.slots')}</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{details.PlayerSpell.map((spell) => (
											<SpellDetails key={spell.Spell.id} {...spell} />
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}
				</>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>{t('modal.close')}</Button>
			</DialogActions>
		</Dialog>
	);
};

const WeaponDetails: React.FC<NonNullable<PlayerApiResponsePlayerData>['PlayerWeapon'][number]> = (
	weapon
) => {
	const [open, setOpen] = useState(false);
	const { t } = useI18n<Locale>();

	return (
		<>
			<TableRow
				sx={{
					'& > *': { borderBottom: weapon.Weapon.description ? 'unset !important' : undefined },
				}}>
				<TableCell align='center' padding='none'>
					{weapon.Weapon.description && (
						<IconButton
							title={open ? t('collapse') : t('expand')}
							size='small'
							onClick={() => setOpen(!open)}>
							{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					)}
				</TableCell>
				<TableCell align='center'>{weapon.Weapon.name}</TableCell>
				<TableCell align='center'>{weapon.Weapon.type}</TableCell>
				<TableCell align='center'>{weapon.Weapon.weight || '-'}</TableCell>
				<TableCell align='center'>{weapon.Weapon.damage}</TableCell>
				<TableCell align='center'>{weapon.Weapon.range}</TableCell>
				<TableCell align='center'>{weapon.Weapon.attacks}</TableCell>
			</TableRow>
			{weapon.Weapon.description && (
				<TableRow>
					<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
						<Collapse in={open}>
							<Typography variant='body1' component='div' pb={1} px={3}>
								{weapon.currentDescription}
							</Typography>
						</Collapse>
					</TableCell>
				</TableRow>
			)}
		</>
	);
};

const ArmorDetails: React.FC<NonNullable<PlayerApiResponsePlayerData>['PlayerArmor'][number]> = (
	armor
) => {
	const [open, setOpen] = useState(false);
	const { t } = useI18n<Locale>();

	return (
		<>
			<TableRow
				sx={{
					'& > *': { borderBottom: armor.Armor.description ? 'unset !important' : undefined },
				}}>
				<TableCell align='center' padding='none'>
					{armor.Armor.description && (
						<IconButton
							title={open ? t('collapse') : t('expand')}
							size='small'
							onClick={() => setOpen(!open)}>
							{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					)}
				</TableCell>
				<TableCell align='center'>{armor.Armor.name}</TableCell>
				<TableCell align='center'>{armor.Armor.type}</TableCell>
				<TableCell align='center'>{armor.Armor.weight || '-'}</TableCell>
				<TableCell align='center'>{armor.Armor.damageReduction}</TableCell>
				<TableCell align='center'>{armor.Armor.penalty}</TableCell>
			</TableRow>
			{armor.Armor.description && (
				<TableRow>
					<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
						<Collapse in={open}>
							<Typography variant='body1' component='div' pb={1} px={3}>
								{armor.currentDescription}
							</Typography>
						</Collapse>
					</TableCell>
				</TableRow>
			)}
		</>
	);
};

const SpellDetails: React.FC<NonNullable<PlayerApiResponsePlayerData>['PlayerSpell'][number]> = (
	spell
) => {
	const [open, setOpen] = useState(false);
	const { t } = useI18n<Locale>();

	return (
		<>
			<TableRow
				sx={{
					'& > *': { borderBottom: spell.Spell.description ? 'unset !important' : undefined },
				}}>
				<TableCell align='center' padding='none'>
					{spell.Spell.description && (
						<IconButton
							title={open ? t('collapse') : t('expand')}
							size='small'
							onClick={() => setOpen(!open)}>
							{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					)}
				</TableCell>
				<TableCell align='center'>{spell.Spell.name}</TableCell>
				<TableCell align='center'>{spell.Spell.type || '-'}</TableCell>
				<TableCell align='center'>{spell.Spell.cost || '-'}</TableCell>
				<TableCell align='center'>{spell.Spell.damage || '-'}</TableCell>
				<TableCell align='center'>{spell.Spell.target || '-'}</TableCell>
				<TableCell align='center'>{spell.Spell.range || '-'}</TableCell>
				<TableCell align='center'>{spell.Spell.castingTime || '-'}</TableCell>
				<TableCell align='center'>{spell.Spell.duration || '-'}</TableCell>
				<TableCell align='center'>{spell.Spell.slots || '-'}</TableCell>
			</TableRow>
			{spell.Spell.description && (
				<TableRow>
					<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
						<Collapse in={open}>
							<Typography variant='body1' component='div' pb={1} px={3}>
								{spell.currentDescription}
							</Typography>
						</Collapse>
					</TableCell>
				</TableRow>
			)}
		</>
	);
};

export default PlayerDetailsDialog;
