import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import LaunchIcon from '@mui/icons-material/Launch';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/AddCircleOutlined';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Fragment, useState } from 'react';
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
					<IconButton onClick={handleClick} aria-label='Add' >
						<AddIcon />
					</IconButton>
					<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
						<MenuItem onClick={onSimpleClick}>TODO: Basico</MenuItem>
						<MenuItem onClick={onComplexClick}>TODO: Complexo</MenuItem>
					</Menu>
				</>
			}>
			<Box position='relative' flex={{ md: '1 0' }} height={{ xs: 250 }} sx={{ overflowY: 'auto' }}>
				<List sx={{ position: 'absolute', left: 0, top: 0, width: '100%' }}>
					{props.basicNpcs.map((npc, index) => (
						<Fragment key={npc.id}>
							<ListItem
								secondaryAction={
									<Tooltip title='TODO: Excluir' describeChild>
										<IconButton size='small' onClick={() => props.onRemoveBasicNpc(npc.id)}>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
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
										<Tooltip title='TODO: Acessar' describeChild>
											<IconButton size='small' href={`/sheet/npc/${npc.id}/1`} target='_blank'>
												<LaunchIcon />
											</IconButton>
										</Tooltip>
										<Tooltip title='TODO: Retrato' describeChild>
											<IconButton
												size='small'
												onClick={() => setPortraitDialogPlayerId(npc.id)}
												sx={{ mx: 1 }}>
												<VideoCameraFrontIcon />
											</IconButton>
										</Tooltip>
										<Tooltip title='TODO: Excluir' describeChild>
											<IconButton size='small' onClick={() => props.onRemoveComplexNpc(npc.id)}>
												<DeleteIcon />
											</IconButton>
										</Tooltip>
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
