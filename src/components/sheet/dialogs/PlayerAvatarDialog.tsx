import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { ApiContext, LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { PlayerPostAvatarApiResponse } from '../../../pages/api/sheet/player/avatar';
import { handleDefaultApiResponse } from '../../../utils';

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

const PlayerAvatarDialog: React.FC<PlayerAvatarDialogProps> = (props) => {
	const { t } = useI18n<Locale>();
	const [avatars, setAvatars] = useState<AvatarData[]>(
		props.playerAvatars.map((avatar) => {
			if (avatar.attributeStatus) {
				return {
					id: avatar.attributeStatus.id,
					name: avatar.attributeStatus.name,
					link: avatar.link || '',
				};
			} else {
				return {
					id: null,
					name: t('default'),
					link: avatar.link || '',
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

	const onCancel = () => {
		props.onClose();
		setAvatars((avatars) => avatars.map((avatar) => ({ ...avatar, link: '' })));
	};

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		for (const avatar of avatars) {
			console.log(avatar);
			if (!avatar.link) continue;
			if (!isValidHttpUrl(avatar.link))
				return alert(t('prompt.invalidAvatar', { name: avatar.name }));
		}

		api
			.post<PlayerPostAvatarApiResponse>('/sheet/player/avatar', { avatarData: avatars })
			.then((res) => {
				if (res.data.status === 'success') {
					props.onSubmit();
					return;
				}
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => props.onClose());
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='sm' fullWidth>
			<DialogTitle>{t('modal.title.avatarEditor')}</DialogTitle>
			<DialogContent>
				<Box
					id='playerAvatarDialogForm'
					component='form'
					display='flex'
					flexDirection='column'
					gap={3}
					mt={1}
					onSubmit={onSubmit}>
					{avatars.map((avatar) => (
						<TextField
							key={avatar.id}
							fullWidth
							variant='standard'
							label={`Avatar (${avatar.name})`}
							value={avatar.link}
							onChange={(ev) => onAvatarChange(avatar.id, ev.target.value)}
						/>
					))}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>{t('modal.cancel')}</Button>
				<Button type='submit' form='playerAvatarDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlayerAvatarDialog;
