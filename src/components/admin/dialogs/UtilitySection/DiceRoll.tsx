import Box from '@mui/material/Box';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import dice from '../../../../../public/dice.webp';
import type { DiceRollEvent } from '../../../../contexts';
import type { DiceConfig } from '../../../../utils/dice';
import DiceRollDialog, { DiceRoll as DiceRollType } from '../../../DiceRollDialog';
import GeneralDiceRollDialog, {
	GeneralDiceRollDialogSubmitHandler,
} from '../../../GeneralDiceRollDialog';
import Section from '../../../sheet/Section';

const DiceRoll: React.FC<{ baseDice: DiceConfig['baseDice'] }> = (props) => {
	const [diceRoll, setDiceRoll] = useState<DiceRollType>({ dice: null });
	const [generalDiceDialogOpen, setGeneralDiceDialogOpen] = useState(false);

	const onRollDice: DiceRollEvent = useCallback(
		(dice, onResult) => setDiceRoll({ dice, onResult }),
		[]
	);

	const onGeneralDiceDialogSubmit: GeneralDiceRollDialogSubmitHandler = (dice) => {
		setGeneralDiceDialogOpen(false);
		if (dice.length > 0) onRollDice(dice);
	};

	return (
		<Section title='Dice Roll'>
			<Box textAlign='center'>
				<GeneralDiceRollDialog
					open={generalDiceDialogOpen}
					onClose={() => setGeneralDiceDialogOpen(false)}
					onSubmit={onGeneralDiceDialogSubmit}>
					<Image
						src={dice}
						alt='D20'
						className='clickable'
						width={80}
						height={80}
						onClick={(ev) => {
							if (ev.ctrlKey) return onRollDice([{ num: 1, roll: props.baseDice }]);
							setGeneralDiceDialogOpen(true);
						}}
					/>
				</GeneralDiceRollDialog>
			</Box>
			<DiceRollDialog onClose={() => setDiceRoll({ dice: null })} {...diceRoll} />
		</Section>
	);
};

export default DiceRoll;
