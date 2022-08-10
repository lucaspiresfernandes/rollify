import Grid from '@mui/material/Grid';
import { useI18n } from 'next-rosetta';
import { memo, startTransition, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DiceRollContext, DiceRollEvent, LoggerContext, SocketContext } from '../../../../contexts';
import type { Locale } from '../../../../i18n';
import type { NpcApiResponse } from '../../../../pages/api/npc';
import { handleDefaultApiResponse } from '../../../../utils';
import { api } from '../../../../utils/createApiClient';
import type { DiceConfig } from '../../../../utils/dice';
import DiceRollDialog, { DiceRoll as DiceRollType } from '../../../DiceRollDialog';
import CombatManager from './CombatManager';
import DiceRoll from './DiceRoll';
import History from './History';
import NpcManager from './NpcManager';

const MemoCombatManager = memo(CombatManager, (prev, next) => prev.entities === next.entities);
const MemoNpcManager = memo(
	NpcManager,
	(prev, next) => prev.basicNpcs === next.basicNpcs && prev.complexNpcs === next.complexNpcs
);
const MemoHistory = memo(History, (prev, next) => prev.players === next.players);

type NPC = { id: number; name: string };

type UtilitySectionProps = {
	players: { id: number; name: string }[];
	npcs: { id: number; name: string }[];
	baseDice: DiceConfig['baseDice'];
};

const UtilitySection: React.FC<UtilitySectionProps> = (props) => {
	const [diceRoll, setDiceRoll] = useState<DiceRollType>({ dice: null });
	const [basicNpcs, setBasicNpcs] = useState<NPC[]>([]);
	const [complexNpcs, setComplexNpcs] = useState(props.npcs);
	const componentDidMount = useRef(false);
	const socket = useContext(SocketContext);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		setBasicNpcs(JSON.parse(localStorage.getItem('admin_npcs') || '[]') as NPC[]);
	}, []);

	useEffect(() => {
		socket.on('playerNameChange', (playerId, value) => {
			setComplexNpcs((complexNpcs) =>
				complexNpcs.map((npc) => {
					if (npc.id === playerId) return { ...npc, name: value };
					return npc;
				})
			);
		});

		return () => {
			socket.off('playerNameChange');
		};
	}, [socket]);

	useEffect(() => {
		if (componentDidMount.current) {
			localStorage.setItem('admin_npcs', JSON.stringify(basicNpcs));
			return;
		}
		componentDidMount.current = true;
	}, [basicNpcs]);

	const addBasicNPC = () => {
		setBasicNpcs([...basicNpcs, { id: Date.now(), name: `NPC ${basicNpcs.length + 1}` }]);
	};

	const removeBasicNPC = (id: number) => {
		setBasicNpcs(basicNpcs.filter((npc) => npc.id !== id));
	};

	const addComplexNPC = () => {
		const name = prompt(t('prompt.addNpcName'));
		if (!name) return;
		api
			.put<NpcApiResponse>('/npc', { name })
			.then((res) => {
				if (res.data.status === 'success')
					return setComplexNpcs([...complexNpcs, { id: res.data.id, name }]);
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const removeComplexNPC = (id: number) => {
		if (!confirm(t('prompt.removeNpc'))) return;
		api
			.delete<NpcApiResponse>('/npc', { data: { id } })
			.then((res) => {
				if (res.data.status === 'success')
					return setComplexNpcs(complexNpcs.filter((npc) => npc.id !== id));
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }));
	};

	const onRollDice: DiceRollEvent = useCallback(
		(dice, onResult) => setDiceRoll({ dice, onResult }),
		[]
	);

	return (
		<Grid container spacing={2} my={2}>
			<DiceRollContext.Provider value={onRollDice}>
				<Grid item md={6} xs={12}>
					<DiceRoll baseDice={props.baseDice} />
				</Grid>
			</DiceRollContext.Provider>
			<Grid item md={6} xs={12}>
				<MemoHistory players={props.players} />
			</Grid>
			<Grid item md={6} xs={12}>
				<MemoNpcManager
					basicNpcs={basicNpcs}
					complexNpcs={complexNpcs}
					onAddBasicNpc={addBasicNPC}
					onRemoveBasicNpc={removeBasicNPC}
					onChangeBasicNpc={(ev, id) =>
						startTransition(() =>
							setBasicNpcs((npcs) =>
								npcs.map((npc) => {
									if (npc.id === id) return { ...npc, name: ev.target.value };
									return npc;
								})
							)
						)
					}
					onAddComplexNpc={addComplexNPC}
					onRemoveComplexNpc={removeComplexNPC}
				/>
			</Grid>
			<Grid item md={6} xs={12}>
				{componentDidMount.current && (
					<MemoCombatManager entities={[...props.players, ...basicNpcs, ...complexNpcs]} />
				)}
			</Grid>
			<DiceRollDialog onClose={() => setDiceRoll({ dice: null })} {...diceRoll} />
		</Grid>
	);
};

export default UtilitySection;
