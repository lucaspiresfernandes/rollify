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
import { getAvatarSize, handleDefaultApiResponse } from '../../../utils';

const AVATAR_SIZE = getAvatarSize(1);

type AvatarData = {
	id: number | null;
	name: string;
	link: string;
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

function isValidHttpUrl(str: string) {
	let url;

	try {
		url = new URL(str);
	} catch (_) {
		return false;
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
}

function getInitialState(avatars: PlayerAvatarDialogProps['playerAvatars']) {
	return avatars.map((avatar) => {
		if (avatar.attributeStatus) {
			return {
				id: avatar.attributeStatus.id,
				name: avatar.attributeStatus.name,
				link: avatar.link || '',
			};
		} else {
			return {
				id: null,
				name: 'TODO: Padrão',
				link: avatar.link || '',
			};
		}
	});
}

const PlayerAvatarDialog: React.FC<PlayerAvatarDialogProps> = (props) => {
	const [avatars, setAvatars] = useState<AvatarData[]>(getInitialState(props.playerAvatars));
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

	const onCancel = () => {
		props.onClose();
		setAvatars(getInitialState(props.playerAvatars));
	};

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		for (const avatar of avatars)
			if (!isValidHttpUrl(avatar.link)) return alert(`TODO: Avatar (${avatar.name}) inválido.`);

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
					TODO: É recomendado que as imagens estejam no tamanho de{' '}
					<b>
						{AVATAR_SIZE[0]}x{AVATAR_SIZE[1]}
					</b>{' '}
					(ou no aspecto de 7:10) e em formato <b>PNG</b>.
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
								value={avatar.link}
								onChange={(ev) => onAvatarChange(avatar.id, ev.target.value)}
							/>
						</Grid>
					))}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button type='submit' form='playerAvatarDialogForm'>
					Apply
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlayerAvatarDialog;
