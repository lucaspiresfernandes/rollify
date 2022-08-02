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
						<PlayerArmorField
							key={armor.id}
							{...armor}
							onDelete={() => {
								if (confirm(t('prompt.delete', { name: 'item' }))) props.onDeleteArmor(armor.id);
							}}
							onTrade={() => props.onTrade('armor', armor.id)}
						/>
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
	return (
		<>
			<TableRow>
				<TableCell align='center' padding='none'>
					<IconButton size='small' onClick={props.onDelete}>
						<DeleteIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center' padding='none' onClick={props.onTrade}>
					<IconButton size='small'>
						<HandshakeIcon />
					</IconButton>
				</TableCell>
				<TableCell align='center'>{props.name}</TableCell>
				<TableCell align='center'>{props.type}</TableCell>
				<TableCell align='center'>{props.weight}</TableCell>
				<TableCell align='center'>{props.damageReduction}</TableCell>
				<TableCell align='center'>{props.penalty}</TableCell>
			</TableRow>
		</>
	);
};

export default PlayerArmorContainer;
