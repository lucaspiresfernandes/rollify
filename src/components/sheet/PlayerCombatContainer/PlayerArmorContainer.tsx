import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Armor, TradeType } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import type { PlayerCombatContainerProps } from '.';
import type { Locale } from '../../../i18n';

type PlayerArmorContainerProps = {
	playerArmor: PlayerCombatContainerProps['playerArmor'];
	onDeleteArmor: (id: number) => void;
	onTrade: (type: Extract<TradeType, 'weapon' | 'armor'>, id: number) => void;
};

const PlayerArmorContainer: React.FC<PlayerArmorContainerProps> = (props) => {
	const { t } = useI18n<Locale>();

	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell padding='none'></TableCell>
						<TableCell padding='none'></TableCell>
						<TableCell align='center'>{t('sheet.table.name')}</TableCell>
						<TableCell align='center'>{t('sheet.table.type')}</TableCell>
						<TableCell align='center'>{t('sheet.table.weight')}</TableCell>
						<TableCell align='center'>{t('sheet.table.damageReduction')}</TableCell>
						<TableCell align='center'>{t('sheet.table.penalty')}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{props.playerArmor.map((armor) => (
						<TableRow key={armor.id}>
							<TableCell align='center' padding='none'>
								<IconButton
									size='small'
									onClick={() => {
										if (confirm(t('prompt.delete', { name: 'item' })))
											props.onDeleteArmor(armor.id);
									}}
									title={t('delete')}>
									<DeleteIcon />
								</IconButton>
							</TableCell>
							<TableCell align='center' padding='none'>
								<IconButton
									size='small'
									onClick={() => props.onTrade('armor', armor.id)}
									title={t('trade')}>
									<HandshakeIcon />
								</IconButton>
							</TableCell>
							<TableCell align='center'>{armor.name}</TableCell>
							<TableCell align='center'>{armor.type}</TableCell>
							<TableCell align='center'>{armor.weight || '-'}</TableCell>
							<TableCell align='center'>{armor.damageReduction}</TableCell>
							<TableCell align='center'>{armor.penalty}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

type PlayerArmorFieldProps = { [T in keyof Armor]: Armor[T] } & {
	onDelete: () => void;
	onTrade: () => void;
};

const PlayerArmorField: React.FC<PlayerArmorFieldProps> = (props) => {
	const { t } = useI18n<Locale>();

	return <></>;
};

export default PlayerArmorContainer;
