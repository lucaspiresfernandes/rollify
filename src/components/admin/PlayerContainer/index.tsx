import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import { useMediaQuery, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useRef, useState } from 'react';
import { LoggerContext, SocketContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { PlayerApiResponse } from '../../../pages/api/sheet/player';
import type { PlayerGetAvatarApiResponse } from '../../../pages/api/sheet/player/avatar/[attrStatusID]';
import { getAvatarSize, handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import GetPortraitDialog from '../dialogs/GetPortraitDialog';
import Details, { DetailsProps } from './Details';

type PlayerContainerProps = {
	players: {
		id: number;
		name: string;
		attribute: {
			id: number;
			name: string;
			color: string;
			value: number;
			maxValue: number;
		}[];
		attributeStatus: {
			id: number;
			value: boolean;
		}[];
	}[];
};

const PlayerContainer: React.FC<PlayerContainerProps> = (props) => {
	const [players, setPlayers] = useState(props.players);
	const [portraitDialogPlayerId, setPortraitDialogPlayerId] = useState<number>(0);
	const socket = useContext(SocketContext);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		socket.on('playerNameChange', (id, name) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id === id) return { ...player, name: name || t('unknown') };
					return player;
				})
			);
		});

		socket.on('playerAttributeChange', (id, attrId, value, maxValue) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id !== id) return player;
					return {
						...player,
						attribute: player.attribute.map((attr) => {
							if (attr.id === attrId) return { ...attr, value, maxValue };
							return attr;
						}),
					};
				})
			);
		});

		socket.on('playerAttributeStatusChange', (id, attrId, value) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id !== id) return player;
					return {
						...player,
						attributeStatus: player.attributeStatus.map((attr) => {
							if (attr.id === attrId) return { ...attr, value };
							return attr;
						}),
					};
				})
			);
		});

		return () => {
			socket.off('playerNameChange');
			socket.off('playerAttributeChange');
			socket.off('playerAttributeStatusChange');
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	if (players.length === 0)
		return (
			<Typography variant='h6' component='h2' textAlign='center' mt={3} color='GrayText'>
				{t('admin.info.noPlayers')}
			</Typography>
		);

	return (
		<>
			<Grid container spacing={2} mt={2} alignItems='stretch'>
				{players.map((player) => (
					<PlayerField
						key={player.id}
						{...player}
						onDeletePlayer={() => setPlayers((p) => p.filter((pl) => pl.id !== player.id))}
						onGetPortrait={() => setPortraitDialogPlayerId(player.id)}
					/>
				))}
			</Grid>
			<GetPortraitDialog
				open={Boolean(portraitDialogPlayerId)}
				onClose={() => setPortraitDialogPlayerId(0)}
				playerId={portraitDialogPlayerId}
			/>
		</>
	);
};

type PlayerFieldProps = PlayerContainerProps['players'][number] & {
	onGetPortrait: () => void;
	onDeletePlayer: () => void;
};

const PlayerField: React.FC<PlayerFieldProps> = (props) => {
	const [showDetails, setShowDetails] = useState(false);
	const [details, setDetails] = useState<DetailsProps['details']>();
	const [loading, setLoading] = useState(false);
	const log = useContext(LoggerContext);
	const socket = useContext(SocketContext);
	const ref = useRef<HTMLDivElement>(null);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		socket.on('playerInfoChange', (id, infoId, value) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerInfo: details.PlayerInfo.map((info) => {
						if (info.Info.id !== infoId) return info;
						return { ...info, value };
					}),
				};
			});
		});

		socket.on('playerSpecChange', (id, specId, value) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerSpec: details.PlayerSpec.map((spec) => {
						if (spec.Spec.id !== specId) return spec;
						return { ...spec, value };
					}),
				};
			});
		});

		socket.on('playerCharacteristicChange', (id, charId, value, modifier) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerCharacteristic: details.PlayerCharacteristic.map((char) => {
						if (char.Characteristic.id !== charId) return char;
						return { ...char, value, modifier };
					}),
				};
			});
		});

		socket.on('playerCurrencyChange', (id, currId, value) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerCurrency: details.PlayerCurrency.map((curr) => {
						if (curr.Currency.id !== currId) return curr;
						return { ...curr, value };
					}),
				};
			});
		});

		socket.on('playerSkillChange', (id, skillId, value, modifier) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerSkill: details.PlayerSkill.map((skill) => {
						if (skill.Skill.id !== skillId) return skill;
						return { ...skill, value, modifier };
					}),
				};
			});
		});

		socket.on('playerItemAdd', (id, Item) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerItem: [
						...details.PlayerItem,
						{ Item, quantity: 1, currentDescription: Item.description },
					],
				};
			});
		});

		socket.on('playerItemRemove', (id, itemId) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerItem: details.PlayerItem.filter((item) => item.Item.id !== itemId),
				};
			});
		});

		socket.on('playerItemChange', (id, itemId, currentDescription, quantity) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerItem: details.PlayerItem.map((item) => {
						if (item.Item.id !== itemId) return item;
						return { ...item, currentDescription, quantity };
					}),
				};
			});
		});

		socket.on('playerWeaponAdd', (id, Weapon) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerWeapon: [...details.PlayerWeapon, { Weapon, currentAmmo: 1 }],
				};
			});
		});

		socket.on('playerWeaponRemove', (id, weaponId) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerWeapon: details.PlayerWeapon.filter((we) => we.Weapon.id !== weaponId),
				};
			});
		});

		socket.on('playerArmorAdd', (id, Armor) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerArmor: [...details.PlayerArmor, { Armor }],
				};
			});
		});

		socket.on('playerArmorRemove', (id, armorId) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerArmor: details.PlayerArmor.filter((ar) => ar.Armor.id !== armorId),
				};
			});
		});

		socket.on('playerSpellAdd', (id, Spell) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerSpell: [...details.PlayerSpell, { Spell }],
				};
			});
		});

		socket.on('playerSpellRemove', (id, spellId) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return {
					...details,
					PlayerSpell: details.PlayerSpell.filter((sp) => sp.Spell.id !== spellId),
				};
			});
		});

		socket.on('playerMaxLoadChange', (id, maxLoad) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return { ...details, maxLoad };
			});
		});

		socket.on('playerSpellSlotsChange', (id, spellSlots) => {
			if (id !== props.id) return;
			setDetails((details) => {
				if (!details) return details;
				return { ...details, spellSlots };
			});
		});

		return () => {
			socket.off('playerInfoChange');
			socket.off('playerSpecChange');
			socket.off('playerCharacteristicChange');
			socket.off('playerCurrencyChange');
			socket.off('playerSkillChange');
			socket.off('playerItemAdd');
			socket.off('playerItemRemove');
			socket.off('playerItemChange');
			socket.off('playerWeaponAdd');
			socket.off('playerWeaponRemove');
			socket.off('playerArmorAdd');
			socket.off('playerArmorRemove');
			socket.off('playerSpellAdd');
			socket.off('playerSpellRemove');
			socket.off('playerMaxLoadChange');
			socket.off('playerSpellSlotsChange');
		};
	}, [socket, props.id]);

	const deletePlayer = () => {
		if (!confirm(t('prompt.delete'))) return;
		setLoading(true);
		api
			.delete<PlayerApiResponse>('/sheet/player', { data: { id: props.id } })
			.then((res) => {
				if (res.data.status === 'success') return props.onDeletePlayer();
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const onShowDetails = () => {
		setLoading(true);
		api
			.get<PlayerApiResponse>('/sheet/player', { params: { id: props.id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				if (res.data.player) {
					setDetails(res.data.player);
					setShowDetails(true);
					return window.scrollTo({ top: ref.current?.offsetTop || 0, behavior: 'smooth' });
				}
				log({ severity: 'error', text: t('error.playerDetailsFetchFailed') });
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	return (
		<Grid item xs={12} md={6} lg={4} ref={ref}>
			<Box borderRadius={2} border='1px solid darkgray' p={1}>
				<Box display='flex' gap={1} alignItems='stretch' position='relative'>
					<PartialBackdrop open={loading}>
						<CircularProgress color='inherit' disableShrink />
					</PartialBackdrop>
					<PlayerAvatarField id={props.id} status={props.attributeStatus} />
					<Box display='flex' flexDirection='column' gap={1} justifyContent='space-between'>
						<Typography variant='h6' component='h2'>
							{props.name}
						</Typography>
						<div>
							{props.attribute.map((attr) => (
								<Box key={attr.id} color={`#${attr.color}`}>
									<Typography variant='body1'>
										{attr.name}: {attr.value}/{attr.maxValue}
									</Typography>
								</Box>
							))}
						</div>
						<Box display='flex' gap={1}>
							{showDetails ? (
								<Tooltip title={`${t('hide')} ${t('details')}`} describeChild>
									<Button variant='outlined' size='small' onClick={() => setShowDetails(false)}>
										<CloseFullscreenIcon />
									</Button>
								</Tooltip>
							) : (
								<Tooltip title={t('details')} describeChild>
									<Button variant='outlined' size='small' onClick={onShowDetails}>
										<OpenInFullIcon />
									</Button>
								</Tooltip>
							)}
							<Tooltip title={t('portrait')} describeChild>
								<Button variant='outlined' size='small' onClick={props.onGetPortrait}>
									<VideoCameraFrontIcon />
								</Button>
							</Tooltip>
							<Tooltip title={t('delete')} describeChild>
								<Button variant='outlined' size='small' onClick={deletePlayer}>
									<DeleteIcon />
								</Button>
							</Tooltip>
						</Box>
					</Box>
				</Box>
				<Collapse
					in={showDetails}
					timeout={{ enter: 750, exit: 750 }}
					onExited={() => setDetails(undefined)}>
					{details && <Details details={details} />}
				</Collapse>
			</Box>
		</Grid>
	);
};

type PlayerAvatarFieldProps = {
	id: number;
	status: { id: number; value: boolean }[];
};

const PlayerAvatarField: React.FC<PlayerAvatarFieldProps> = (props) => {
	const [src, setSrc] = useState('#');
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);
	const theme = useTheme();
	const media = useMediaQuery(theme.breakpoints.up('sm'));

	const AVATAR_SIZE = getAvatarSize(media ? 0.32 : 0.24);

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
				setSrc('/avatar404.png');
			})
			.catch(() => setSrc('/avatar404.png'));
	}, [props]);

	return (
		<div>
			<Avatar
				sx={{
					width: AVATAR_SIZE[0],
					height: AVATAR_SIZE[1],
					backgroundColor: 'transparent',
				}}>
				<img
					src={src}
					alt='Character Avatar'
					style={{ width: '100%', maxWidth: AVATAR_SIZE[0], height: 'auto' }}
					onError={() => {
						if (src !== '#') setSrc('/avatar404.png');
					}}
				/>
			</Avatar>
		</div>
	);
};

export default PlayerContainer;
