import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import VideocamIcon from '@mui/icons-material/Videocam';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LoggerContext, SocketContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { NpcApiResponse } from '../../../pages/api/npc';
import type { PlayerApiResponse } from '../../../pages/api/sheet/player';
import { getAvatarSize, handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import GetPortraitDialog from '../dialogs/GetPortraitDialog';
import UtilitySection from '../dialogs/UtilitySection';
import PlayerAvatarImage from './PlayerAvatarImage';
import PlayerDetailsDialog, { PlayerDetailsDialogProps } from './PlayerDetailsDialog';

type CharacterContainerProps = {
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

	npcs: {
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

	baseDice: number;
};

const AVATAR_SIZE = getAvatarSize(0.35);

const CharacterContainer: React.FC<CharacterContainerProps> = (props) => {
	const [players, setPlayers] = useState(props.players);
	const [npcs, setNpcs] = useState(props.npcs);
	const [archivedCharacters, setArchivedCharacters] = useState<
		(typeof props.players[number] & { npc: boolean })[]
	>([]);
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
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		const archivedIds = JSON.parse(localStorage.getItem('archived_players') || '[]');
		setArchivedCharacters([
			...players
				.filter((player) => archivedIds.includes(player.id))
				.map((p) => ({ ...p, npc: false })),
			...npcs.filter((player) => archivedIds.includes(player.id)).map((p) => ({ ...p, npc: true })),
		]);
		setPlayers(players.filter((player) => !archivedIds.includes(player.id)));
		setNpcs(npcs.filter((player) => !archivedIds.includes(player.id)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		localStorage.setItem(
			'archived_players',
			JSON.stringify(archivedCharacters.map((player) => player.id))
		);
	}, [archivedCharacters]);

	useEffect(() => {
		if (!socket) return;

		socket.on('playerNameChange', (id, name) => {
			setPlayers((p) =>
				p.map((player) => {
					if (player.id === id) return { ...player, name: name || t('unknown') };
					return player;
				})
			);

			setNpcs((npcs) =>
				npcs.map((npc) => {
					if (npc.id === id) return { ...npc, name: name || t('unknown') };
					return npc;
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

			setNpcs((npcs) =>
				npcs.map((npc) => {
					if (npc.id !== id) return npc;
					return {
						...npc,
						attribute: npc.attribute.map((attr) => {
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

			setNpcs((npcs) =>
				npcs.map((npc) => {
					if (npc.id !== id) return npc;
					return {
						...npc,
						attributeStatus: npc.attributeStatus.map((attr) => {
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

		socket.on('playerSpellAdd', (id, spell) => {
			setDetails((details) => {
				if (!details || details.id !== id) return details;
				return {
					...details,
					PlayerSpell: [...details.PlayerSpell, { ...spell, ...spell.Spell }],
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

	const addNpc = useCallback(() => {
		const name = prompt(t('prompt.addNpcName'));
		if (!name) return;
		api
			.put<NpcApiResponse>('/npc', { name })
			.then((res) => {
				if (res.data.status === 'success') {
					const npc = res.data.npc as NonNullable<typeof res.data.npc>;
					return setNpcs((npcs) => [
						...npcs,
						{
							id: npc.id,
							name: npc.name,
							attribute: npc.PlayerAttributes.map((attr) => ({ ...attr, ...attr.Attribute })),
							attributeStatus: npc.PlayerAttributeStatus.map((attr) => ({
								...attr,
								...attr.AttributeStatus,
							})),
						},
					]);
				}
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	}, [log, t]);

	return (
		<>
			<Grid container spacing={2} py={2} alignItems='start'>
				{archivedCharacters.map((char) => (
					<Grid item xs={6} md={4} lg={3} key={char.id}>
						<Paper elevation={6} sx={{ borderRadius: 4 }}>
							<Box p={1.5} display='flex' justifyContent='space-between'>
								<Typography variant='h5'>
									{char.npc ? 'NPC: ' : ''}
									{char.name}
								</Typography>
								<Tooltip title={t('unarchive')} describeChild>
									<Button
										variant='contained'
										size='small'
										onClick={() => {
											if (char.npc) setNpcs((npcs) => [...npcs, char]);
											else setPlayers((players) => [...players, char]);
											setArchivedCharacters((archivedPlayers) =>
												archivedPlayers.filter((p) => p.id !== char.id)
											);
										}}>
										<UnarchiveIcon />
									</Button>
								</Tooltip>
							</Box>
						</Paper>
					</Grid>
				))}
			</Grid>
			<Grid container spacing={2} pb={3} alignItems='start'>
				{players.map((player) => (
					<Grid item xs={12} md={6} lg={4} key={player.id}>
						<PlayerField
							{...player}
							onGetPortrait={() => setPortraitDialogPlayerId(player.id)}
							onShowDetails={(det) => {
								setShowDetails(true);
								setDetails(det);
							}}
							onDelete={() => setPlayers((p) => p.filter((pl) => pl.id !== player.id))}
							onArchive={() => {
								setPlayers((p) => p.filter((pl) => pl.id !== player.id));
								setArchivedCharacters((ap) => [...ap, { ...player, npc: false }]);
							}}
						/>
					</Grid>
				))}
			</Grid>

			<Divider />

			<Typography my={3} textAlign='end'>
				<Button variant='contained' color='primary' onClick={addNpc}>
					Add new NPC
				</Button>
			</Typography>
			<Grid container spacing={2} pb={3} alignItems='start' textAlign='start'>
				{npcs.map((npc) => (
					<Grid item xs={12} md={6} lg={4} key={npc.id}>
						<NpcField
							{...npc}
							onGetPortrait={() => setPortraitDialogPlayerId(npc.id)}
							onDelete={() => setNpcs((np) => np.filter((n) => n.id !== npc.id))}
							onArchive={() => {
								setNpcs((npcs) => npcs.filter((n) => n.id !== npc.id));
								setArchivedCharacters((ap) => [...ap, { ...npc, npc: true }]);
							}}
						/>
					</Grid>
				))}
			</Grid>

			<Divider />

			<UtilitySection players={[...players, ...npcs]} baseDice={props.baseDice} />

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

type PlayerFieldProps = CharacterContainerProps['players'][number] & {
	onShowDetails: (details: PlayerDetailsDialogProps['details']) => void;
	onGetPortrait: () => void;
	onDelete: () => void;
	onArchive: () => void;
};

const PlayerField: React.FC<PlayerFieldProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const deletePlayer = () => {
		if (!confirm(t('prompt.delete', { name: 'item' }))) return;
		setLoading(true);
		api
			.delete<PlayerApiResponse>('/sheet/player', { data: { id: props.id } })
			.then((res) => {
				if (res.data.status === 'success') return props.onDelete();
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
		<Paper elevation={6} sx={{ borderRadius: 4 }}>
			<Box display='flex' gap={1} p={1.5} position='relative'>
				<PartialBackdrop open={loading}>
					<CircularProgress color='inherit' disableShrink />
				</PartialBackdrop>
				<Box display='flex' alignItems='center' width={AVATAR_SIZE[0]} height={AVATAR_SIZE[1]}>
					<PlayerAvatarImage id={props.id} status={props.attributeStatus} width={AVATAR_SIZE[0]} />
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
					<Grid container spacing={1} justifyContent='start' alignItems='center'>
						<Grid item xs={6}>
							<Tooltip title={t('details')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									onClick={onShowDetails}>
									<OpenInFullIcon />
								</Button>
							</Tooltip>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title={t('portrait')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									onClick={props.onGetPortrait}>
									<VideocamIcon />
								</Button>
							</Tooltip>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title={t('delete')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									onClick={deletePlayer}>
									<DeleteIcon />
								</Button>
							</Tooltip>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title={t('archive')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									onClick={props.onArchive}>
									<ArchiveIcon />
								</Button>
							</Tooltip>
						</Grid>
					</Grid>
				</Box>
			</Box>
		</Paper>
	);
};

type NpcFieldProps = CharacterContainerProps['npcs'][number] & {
	onGetPortrait: () => void;
	onDelete: () => void;
	onArchive: () => void;
};

const NpcField: React.FC<NpcFieldProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const deleteNpc = () => {
		if (!confirm(t('prompt.delete', { name: 'item' }))) return;
		setLoading(true);
		api
			.delete<NpcApiResponse>('/npc', { data: { id: props.id } })
			.then((res) => {
				if (res.data.status === 'success') return props.onDelete();
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	return (
		<Paper elevation={2} sx={{ borderRadius: 4 }}>
			<Box display='flex' gap={1} p={1.5} position='relative'>
				<PartialBackdrop open={loading}>
					<CircularProgress color='inherit' disableShrink />
				</PartialBackdrop>
				<Box display='flex' alignItems='center' width={AVATAR_SIZE[0]} height={AVATAR_SIZE[1]}>
					<PlayerAvatarImage id={props.id} status={props.attributeStatus} width={AVATAR_SIZE[0]} />
				</Box>
				<Box display='flex' flexDirection='column' gap={1} justifyContent='space-between'>
					<Typography variant='h6' component='h2'>
						NPC: {props.name}
					</Typography>
					<div>
						{props.attribute.map((attr) => (
							<Typography key={attr.id} variant='body1' color={`#${attr.color}`}>
								{attr.name}: {attr.value + attr.extraValue}/{attr.maxValue}
							</Typography>
						))}
					</div>
					<Grid container spacing={1} justifyContent='start' alignItems='center'>
						<Grid item xs={6}>
							<Tooltip title={t('access')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									target='_blank'
									href={`/sheet/npc/${props.id}/1`}>
									<LaunchIcon />
								</Button>
							</Tooltip>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title={t('portrait')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									onClick={props.onGetPortrait}>
									<VideocamIcon />
								</Button>
							</Tooltip>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title={t('delete')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									onClick={deleteNpc}>
									<DeleteIcon />
								</Button>
							</Tooltip>
						</Grid>
						<Grid item xs={6}>
							<Tooltip title={t('archive')} describeChild disableInteractive>
								<Button
									disableRipple
									fullWidth
									variant='contained'
									size='small'
									onClick={props.onArchive}>
									<ArchiveIcon />
								</Button>
							</Tooltip>
						</Grid>
					</Grid>
				</Box>
			</Box>
		</Paper>
	);
};

export default CharacterContainer;
