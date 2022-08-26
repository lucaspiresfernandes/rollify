import Grid from '@mui/material/Grid';
import { useI18n } from 'next-rosetta';
import { memo, startTransition, useContext, useEffect, useRef, useState } from 'react';
import { LoggerContext } from '../../../../contexts';
import type { Locale } from '../../../../i18n';
import type { DiceConfig } from '../../../../utils/dice';
import CombatManager from './CombatManager';
import DiceRoll from './DiceRoll';
import History from './History';
import NpcManager from './NpcManager';

const MemoCombatManager = memo(CombatManager, (prev, next) => prev.entities === next.entities);
const MemoNpcManager = memo(NpcManager, (prev, next) => prev.npcs === next.npcs);
const MemoHistory = memo(History, (prev, next) => prev.players === next.players);

type NPC = { id: number; name: string };

type UtilitySectionProps = {
	players: { id: number; name: string }[];
	baseDice: DiceConfig['baseDice'];
};

const UtilitySection: React.FC<UtilitySectionProps> = (props) => {
	const [basicNpcs, setBasicNpcs] = useState<NPC[]>([]);
	const componentDidMount = useRef(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		setBasicNpcs(JSON.parse(localStorage.getItem('admin_npcs') || '[]') as NPC[]);
	}, []);

	useEffect(() => {
		if (componentDidMount.current) {
			localStorage.setItem('admin_npcs', JSON.stringify(basicNpcs));
			return;
		}
		componentDidMount.current = true;
	}, [basicNpcs]);

	return (
		<Grid container spacing={2} my={2}>
			<Grid item md={6} xs={12}>
				<DiceRoll baseDice={props.baseDice} />
			</Grid>
			<Grid item md={6} xs={12}>
				<MemoHistory players={props.players} />
			</Grid>
			<Grid item md={6} xs={12}>
				<MemoNpcManager
					npcs={basicNpcs}
					onAddNpc={() =>
						setBasicNpcs([...basicNpcs, { id: Date.now(), name: `NPC ${basicNpcs.length + 1}` }])
					}
					onRemoveNpc={(id) => setBasicNpcs(basicNpcs.filter((npc) => npc.id !== id))}
					onChangeNpc={(ev, id) =>
						startTransition(() =>
							setBasicNpcs((npcs) =>
								npcs.map((npc) => {
									if (npc.id === id) return { ...npc, name: ev.target.value };
									return npc;
								})
							)
						)
					}
				/>
			</Grid>
			<Grid item md={6} xs={12}>
				{componentDidMount.current && (
					<MemoCombatManager entities={[...props.players, ...basicNpcs]} />
				)}
			</Grid>
		</Grid>
	);
};

export default UtilitySection;