import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { Fragment, useState } from 'react';
import type { Locale } from '../../../../i18n';
import Section from '../../../sheet/Section';
import GetPortraitDialog from '../GetPortraitDialog';

type NpcManagerProps = {
	basicNpcs: { id: number; name: string }[];
	complexNpcs: { id: number; name: string }[];
	onChangeBasicNpc: (
		ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		id: number
	) => void;
	onAddBasicNpc: () => void;
	onRemoveBasicNpc: (id: number) => void;
	onAddComplexNpc: () => void;
	onRemoveComplexNpc: (id: number) => void;
};

const NpcManager: React.FC<NpcManagerProps> = (props) => {
	const [portraitDialogPlayerId, setPortraitDialogPlayerId] = useState<number>();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const { t } = useI18n<Locale>();

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (ev) =>
		setAnchorEl(ev.currentTarget);

	const handleClose = () => setAnchorEl(null);

	const onSimpleClick = () => {
		handleClose();
		props.onAddBasicNpc();
	};

	const onComplexClick = () => {
		handleClose();
		props.onAddComplexNpc();
	};

	return (
		<Section
			title='NPCs'
			display='flex'
			flexDirection='column'
			height='100%'
			sideButton={
				<>
					<IconButton onClick={handleClick} aria-label='Add'>
						<AddIcon />
					</IconButton>
					<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
						<MenuItem onClick={onSimpleClick}>{t('simple')}</MenuItem>
						<MenuItem onClick={onComplexClick}>{t('advanced')}</MenuItem>
					</Menu>
				</>
			}>
			<Box position='relative' flex={{ md: '1 0' }} height={{ xs: 250 }} sx={{ overflowY: 'auto' }}>
				<List sx={{ position: 'absolute', left: 0, top: 0, width: '100%' }}>
					{props.basicNpcs.map((npc, index) => (
						<Fragment key={npc.id}>
							<ListItem
								secondaryAction={
									<IconButton
										size='small'
										onClick={() => props.onRemoveBasicNpc(npc.id)}
										title={t('delete')}>
										<DeleteIcon />
									</IconButton>
								}
								sx={{ pr: 8 }}>
								<TextField
									variant='standard'
									label='Name'
									value={npc.name}
									onChange={(ev) => props.onChangeBasicNpc(ev, npc.id)}
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
							<Divider variant='middle' component='li' />
						</Fragment>
					))}
					{props.complexNpcs.map((npc, index) => (
						<Fragment key={npc.id}>
							<ListItem
								secondaryAction={
									<>
										<IconButton
											size='small'
											href={`/sheet/npc/${npc.id}/1`}
											target='_blank'
											title={t('access')}>
											<LaunchIcon />
										</IconButton>
										<IconButton
											size='small'
											onClick={() => setPortraitDialogPlayerId(npc.id)}
											sx={{ mx: 1 }}
											title={t('portrait')}>
											<VideoCameraFrontIcon />
										</IconButton>
										<IconButton
											size='small'
											onClick={() => props.onRemoveComplexNpc(npc.id)}
											title={t('delete')}>
											<DeleteIcon />
										</IconButton>
									</>
								}>
								<ListItemText>{npc.name}</ListItemText>
							</ListItem>
							{index < props.basicNpcs.length - 1 && <Divider variant='middle' component='li' />}
						</Fragment>
					))}
				</List>
				<GetPortraitDialog
					open={Boolean(portraitDialogPlayerId)}
					onClose={() => setPortraitDialogPlayerId(undefined)}
					playerId={portraitDialogPlayerId || 0}
				/>
			</Box>
		</Section>
	);
};

export default NpcManager;
