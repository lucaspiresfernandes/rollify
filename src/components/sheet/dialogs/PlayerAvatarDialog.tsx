import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Grid from '@mui/material/Grid';
import { useContext, useState } from 'react';
import Link from 'next/link';
import { ApiContext, LoggerContext } from '../../../contexts';
import type { PlayerPostAvatarApiResponse } from '../../../pages/api/sheet/player/avatar';
import { handleDefaultApiResponse } from '../../../utils';

type AvatarData = {
	id: number | null;
	name: string;
	link: string | null;
};

type PlayerAvatarDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: () => void;
	playerAvatars: {
		link: string | null;
		attributeStatus: {
			id: number;
			name: string;
		} | null;
	}[];
};

const PlayerAvatarDialog: React.FC<PlayerAvatarDialogProps> = (props) => {
	const [avatars, setAvatars] = useState<AvatarData[]>(
		props.playerAvatars.map((avatar) => {
			if (avatar.attributeStatus) {
				return {
					id: avatar.attributeStatus.id,
					name: avatar.attributeStatus.name,
					link: avatar.link,
				};
			} else {
				return {
					id: null,
					name: 'TODO: Padrão',
					link: avatar.link,
				};
			}
		})
	);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	const onAvatarChange = (id: number | null, newLink: string) => {
		setAvatars((avatars) =>
			avatars.map((avatar) => {
				if (avatar.id === id)
					return {
						...avatar,
						link: newLink,
					};
				return avatar;
			})
		);
	};

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();
		api
			.post<PlayerPostAvatarApiResponse>('/sheet/player/avatar', { avatarData: avatars })
			.then((res) => {
				if (res.data.status === 'success') {
					props.onSubmit();
					return;
				}
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: 'Unknown error: ' + err.message }))
			.finally(() => props.onClose());
	};

	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>TODO: PLAYER AVATAR</DialogTitle>
			<DialogContent>
				<DialogContentText>
					TODO: É recomendado que as imagens estejam no tamanho de <b>420x600</b> (ou no aspecto de
					7:10) e em formato <b>PNG</b>.
				</DialogContentText>
				<DialogContentText>
					TODO: Apenas são aceitos links de imagens upadas no site{' '}
					<Link href='https://imgur.com/' target='_blank'>
						Imgur
					</Link>{' '}
					ou no Discord.
				</DialogContentText>
				<Grid
					container
					component='form'
					id='playerAvatarDialogForm'
					onSubmit={onSubmit}
					spacing={3}
					mt={0}>
					{avatars.map((avatar) => (
						<Grid item key={avatar.id} xs={12}>
							<TextField
								fullWidth
								variant='standard'
								label={`Avatar (${avatar.name})`}
								value={avatar.link || ''}
								onChange={(ev) => onAvatarChange(avatar.id, ev.target.value)}
							/>
						</Grid>
					))}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>Cancel</Button>
				<Button type='submit' form='playerAvatarDialogForm' onClick={props.onClose}>
					Apply
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlayerAvatarDialog;
