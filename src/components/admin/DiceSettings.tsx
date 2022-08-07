import type { DiceConfig } from '../../utils/dice';

type DiceSettingsProps = {
	diceConfig: DiceConfig;
};

const DiceSettings: React.FC<DiceSettingsProps> = (props) => {
	return <h1>Dice Settings</h1>;
};

export default DiceSettings;
