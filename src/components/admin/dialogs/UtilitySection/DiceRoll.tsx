import { useContext, useState } from 'react';
import { DiceRollContext } from '../../../../contexts';
import GeneralDiceRollDialog, {
	DEFAULT_ROLL,
	GeneralDiceRollDialogSubmitHandler,
} from '../../../GeneralDiceRollDialog';
import Section from '../../../sheet/Section';
import dice20 from '../../../../../public/dice20.webp';
import Image from 'next/image';
import Box from '@mui/material/Box';

const DiceRoll: React.FC = () => {
	const [generalDiceDialogOpen, setGeneralDiceDialogOpen] = useState(false);
	const rollDice = useContext(DiceRollContext);

	const onGeneralDiceDialogSubmit: GeneralDiceRollDialogSubmitHandler = (dice) => {
		setGeneralDiceDialogOpen(false);
		if (dice.length > 0) rollDice(dice);
	};

	return (
		<Section title='Dice Roll'>
			<Box my={2} textAlign='center' >
				<GeneralDiceRollDialog
					open={generalDiceDialogOpen}
					onClose={() => setGeneralDiceDialogOpen(false)}
					onSubmit={onGeneralDiceDialogSubmit}>
					<Image
						src={dice20}
						alt='D20'
						className='clickable'
						width={80}
						height={80}
						onClick={(ev) => {
							if (ev.ctrlKey) return rollDice(DEFAULT_ROLL);
							setGeneralDiceDialogOpen(true);
						}}
					/>
				</GeneralDiceRollDialog>
			</Box>
		</Section>
	);
};

export default DiceRoll;
