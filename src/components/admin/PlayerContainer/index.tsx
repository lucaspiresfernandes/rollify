import DeleteIcon from '@mui/icons-material/Delete';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useRef, useState } from 'react';
import { LoggerContext, SocketContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { PlayerApiResponse } from '../../../pages/api/sheet/player';
import { getAvatarSize, handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import GetPortraitDialog from '../dialogs/GetPortraitDialog';
import PlayerAvatarImage from './PlayerAvatarImage';
import PlayerDetailsDialog, { PlayerDetailsDialogProps } from './PlayerDetailsDialog';

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
			extraValue: number;
		}[];
		attributeStatus: {
			id: number;
			value: boolean;
		}[];
	}[];
};

const AVATAR_SIZE = getAvatarSize(0.35);

const PlayerContainer: React.FC<PlayerContainerProps> = (props) => {
	const [players, setPlayers] = useState(props.players);
	const [portraitDialogPlayerId, setPortraitDialogPlayerId] = useState<number>(0);
	const [showDetails, setShowDetails] = useState(false);
	const [details, setDetails] = useState<PlayerDetailsDialogProps['details']>({
		id: 0,
		maxLoad: 0,
		spellSlots: 0,
		name: '',
		PlayerArmor: [],
		PlayerAttributes: [],
		PlayerAttributeStatus: [],
		PlayerCharacteristic: [],
		PlayerCurrency: [],
		PlayerInfo: [],
		PlayerItem: [],
		PlayerSkill: [],
		PlayerSpell: [],
		PlayerWeapon: [],
		PlayerSpec: [],
	});
	const socket = useContext(SocketContext);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (!socket) return;

		socket.on('playerNameChange', (id, name) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id === id) return { ...player, name: name || t('unknown') };
					return player;
				})
			);

			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return { ...details, name };
			});
		});

		socket.on('playerAttributeChange', (id, attrId, value, maxValue, extraValue) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id !== id) return player;
					return {
						...player,
						attribute: player.attribute.map((attr) => {
							if (attr.id === attrId) return { ...attr, value, maxValue, extraValue };
							return attr;
						}),
					};
				})
			);

			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerAttributes: details.PlayerAttributes.map((attr) => {
						if (attr.Attribute.id === attrId) return { ...attr, value, maxValue, extraValue };
						return attr;
					}),
				};
			});
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

			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerAttributeStatus: details.PlayerAttributeStatus.map((attr) => {
						if (attr.AttributeStatus.id === attrId) return { ...attr, value };
						return attr;
					}),
				};
			});
		});

		socket.on('playerInfoChange', (id, infoId, value) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
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
			setDetails((details) => {
				if (!details || details.id !== id) return details;
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
			setDetails((details) => {
				if (!details || details.id !== id) return details;
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
			setDetails((details) => {
				if (!details || details.id !== id) return details;
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
			setDetails((details) => {
				if (!details || details.id !== id) return details;
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
			setDetails((details) => {
				if (!details || details.id !== id) return details;
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
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerItem: details.PlayerItem.filter((item) => item.Item.id !== itemId),
				};
			});
		});

		socket.on('playerItemChange', (id, itemId, currentDescription, quantity) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerItem: details.PlayerItem.map((item) => {
						if (item.Item.id !== itemId) return item;
						return { ...item, currentDescription, quantity };
					}),
				};
			});
		});

		socket.on('playerWeaponAdd', (id, weapon) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerWeapon: [...details.PlayerWeapon, weapon],
				};
			});
		});

		socket.on('playerWeaponRemove', (id, weaponId) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerWeapon: details.PlayerWeapon.filter((we) => we.Weapon.id !== weaponId),
				};
			});
		});

		socket.on('playerWeaponChange', (id, weaponId, currentDescription) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerWeapon: details.PlayerWeapon.map((weapon) => {
						if (weapon.Weapon.id !== weaponId) return weapon;
						return { ...weapon, currentDescription };
					}),
				};
			});
		});

		socket.on('playerArmorAdd', (id, armor) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerArmor: [...details.PlayerArmor, armor],
				};
			});
		});

		socket.on('playerArmorRemove', (id, armorId) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerArmor: details.PlayerArmor.filter((ar) => ar.Armor.id !== armorId),
				};
			});
		});

		socket.on('playerArmorChange', (id, armorId, currentDescription) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerArmor: details.PlayerArmor.map((armor) => {
						if (armor.Armor.id !== armorId) return armor;
						return { ...armor, currentDescription };
					}),
				};
			});
		});

		socket.on('playerSpellAdd', (id, Spell) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerSpell: [...details.PlayerSpell, { Spell }],
				};
			});
		});

		socket.on('playerSpellRemove', (id, spellId) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerSpell: details.PlayerSpell.filter((sp) => sp.Spell.id !== spellId),
				};
			});
		});

		socket.on('playerSpellChange', (id, spellId, currentDescription) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerSpell: details.PlayerSpell.map((spell) => {
						if (spell.Spell.id !== spellId) return spell;
						return { ...spell, currentDescription };
					}),
				};
			});
		});

		socket.on('playerMaxLoadChange', (id, maxLoad) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return { ...details, maxLoad };
			});
		});

		socket.on('playerSpellSlotsChange', (id, spellSlots) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return { ...details, spellSlots };
			});
		});

		return () => {
			socket.off('playerNameChange');
			socket.off('playerAttributeChange');
			socket.off('playerAttributeStatusChange');
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
						onShowDetails={(det) => {
							setShowDetails(true);
							setDetails(det);
						}}
					/>
				))}
			</Grid>
			<GetPortraitDialog
				open={Boolean(portraitDialogPlayerId)}
				onClose={() => setPortraitDialogPlayerId(0)}
				playerId={portraitDialogPlayerId}
			/>
			<PlayerDetailsDialog
				open={showDetails}
				onClose={() => setShowDetails(false)}
				details={details}
			/>
		</>
	);
};

type PlayerFieldProps = PlayerContainerProps['players'][number] & {
	onShowDetails: (details: PlayerDetailsDialogProps['details']) => void;
	onGetPortrait: () => void;
	onDeletePlayer: () => void;
};

const PlayerField: React.FC<PlayerFieldProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const log = useContext(LoggerContext);
	const ref = useRef<HTMLDivElement>(null);
	const { t } = useI18n<Locale>();

	const deletePlayer = () => {
		if (!confirm(t('prompt.delete', { name: 'item' }))) return;
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
				if (res.data.player) return props.onShowDetails(res.data.player);
				log({ severity: 'error', text: t('error.playerDetailsFetchFailed') });
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	return (
		<Grid item xs={12} md={6} lg={4} ref={ref}>
			<Box borderRadius={2} border='1px solid darkgray' p={1}>
				<Box display='flex' gap={1} position='relative'>
					<PartialBackdrop open={loading}>
						<CircularProgress color='inherit' disableShrink />
					</PartialBackdrop>
					<Box display='flex' alignItems='center' width={AVATAR_SIZE[0]} height={AVATAR_SIZE[1]}>
						<PlayerAvatarImage
							id={props.id}
							status={props.attributeStatus}
							width={AVATAR_SIZE[0]}
						/>
					</Box>
					<Box display='flex' flexDirection='column' gap={1} justifyContent='space-between'>
						<Typography variant='h6' component='h2'>
							{props.name}
						</Typography>
						<div>
							{props.attribute.map((attr) => (
								<Typography key={attr.id} variant='body1' color={`#${attr.color}`}>
									{attr.name}: {attr.value + attr.extraValue}/{attr.maxValue}
								</Typography>
							))}
						</div>
						<Box display='flex' flexWrap='wrap' gap={1}>
							<Tooltip title={t('details')} describeChild>
								<Button variant='outlined' size='small' onClick={onShowDetails}>
									<OpenInFullIcon />
								</Button>
							</Tooltip>
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
			</Box>
		</Grid>
	);
};

export default PlayerContainer;
