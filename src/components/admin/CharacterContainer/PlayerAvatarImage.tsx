import { useEffect, useRef, useState } from 'react';
import type { PlayerGetAvatarApiResponse } from '../../../pages/api/sheet/player/avatar/[attrStatusID]';
import { api } from '../../../utils/createApiClient';
import Avatar from '@mui/material/Avatar';

type PlayerAvatarImageProps = {
	id: number;
	status: { id: number; value: boolean }[];
	width: number;
};

const PlayerAvatarImage: React.FC<PlayerAvatarImageProps> = (props) => {
	const [src, setSrc] = useState('/avatar404.webp');
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		let statusId = 0;
		for (const stat of props.status) {
			if (stat.value) {
				statusId = stat.id;
				break;
			}
		}
		if (statusId === previousStatusID.current) return;
		previousStatusID.current = statusId;
		api
			.get<PlayerGetAvatarApiResponse>(`/sheet/player/avatar/${statusId}`, {
				params: { playerID: props.id },
			})
			.then(({ data }) => {
				if (data.status === 'success') {
					setSrc(data.link);
					return;
				}
				setSrc('/avatar404.webp');
			})
			.catch(() => setSrc('/avatar404.webp'));
	}, [props.id, props.status]);

	return (
		<Avatar
			src={src}
			alt='Character Avatar'
			style={{ width: '100%', maxWidth: props.width, height: 'auto' }}
			onError={() => {
				if (src !== '#') setSrc('/avatar404.webp');
			}}
		/>
	);
};

export default PlayerAvatarImage;
