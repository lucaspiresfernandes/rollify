import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import type { Locale } from '../../../../i18n';
import Section from '../../../sheet/Section';

type NpcManagerProps = {
	npcs: { id: number; name: string }[];
	onChangeNpc: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: number) => void;
	onAddNpc: () => void;
	onRemoveNpc: (id: number) => void;
};

const NpcManager: React.FC<NpcManagerProps> = (props) => {
	const { t } = useI18n<Locale>();

	return (
		<Section
			title={t('admin.npcTitle')}
			sideButton={
				<IconButton onClick={props.onAddNpc} aria-label='Add'>
					<AddIcon />
				</IconButton>
			}>
			<List>
				{props.npcs.map((npc) => (
					<ListItem
						key={npc.id}
						secondaryAction={
							<IconButton
								size='small'
								onClick={() => props.onRemoveNpc(npc.id)}
								title={t('delete')}>
								<DeleteIcon />
							</IconButton>
						}
						sx={{ pr: 8 }}>
						<TextField
							variant='standard'
							label='Name'
							defaultValue={npc.name}
							onChange={(ev) => props.onChangeNpc(ev, npc.id)}
							sx={{ flex: '1', pr: 4 }}
						/>
						<TextField
							variant='standard'
							label='Health'
							defaultValue='0/0'
							sx={{ width: '5rem' }}
							inputProps={{ style: { textAlign: 'center' } }}
						/>
					</ListItem>
				))}
			</List>
		</Section>
	);
};

export default NpcManager;
