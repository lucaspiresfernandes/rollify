type DiceConfigCell = {
	value: 20 | 100;
	branched: boolean;
};

export type DiceConfig = {
	characteristic: DiceConfigCell & {
		enable_modifiers: boolean;
	};
	skill: DiceConfigCell & {
		enable_modifiers: boolean;
		enable_automatic_markers: boolean;
	};
	attribute: DiceConfigCell;
};

export type ResolvedDice = {
	num?: number;
	roll: number;
	ref?: number;
	branched?: boolean;
};

export type DiceRequest = ResolvedDice | ResolvedDice[];

export type DiceResponse = {
	roll: number;
	resultType?: {
		//0: normal, < 0: failure, > 0: success
		successWeight: number;
		description: string;
	};
};

export function resolveDices(dices: string) {
	let formattedDiceString = dices.replace(/\s/g, '').toUpperCase();

	const options = formattedDiceString.split('|');

	if (options.length > 1) {
		const selected = prompt(
			'TODO: Escolha dentre as seguintes opções de rolagem:\n' +
				options.map((opt, i) => `${i + 1}: ${opt}`).join('\n')
		);

		if (!selected) return;

		const code = parseInt(selected);

		if (!code || code > options.length) return;

		formattedDiceString = options[code - 1];
	}

	const diceArray = formattedDiceString.split('+');
	const resolvedDices: ResolvedDice[] = new Array(diceArray.length);

	for (let i = 0; i < diceArray.length; i++) resolvedDices[i] = resolveDice(diceArray[i]);

	return resolvedDices;
}

function resolveDice(dice: string): ResolvedDice {
	const regexResult = dice.match(/[A-Z][A-Z][A-Z]/);

	if (regexResult) {
		const utilName = regexResult[0];

		const utilElement = (
			document.getElementsByName(`diceUtil${utilName}`) as NodeListOf<HTMLInputElement>
		)[0] as HTMLInputElement | undefined;

		if (utilElement) {
			const utilElementModifier = (
				document.getElementsByName(`diceUtilMod${utilName}`) as NodeListOf<HTMLInputElement>
			)[0] as HTMLInputElement | undefined;

			const value = utilElement.value.replace(/\s/g, '').toUpperCase();
			let modifier = 0;
			if (utilElementModifier) modifier = parseInt(utilElementModifier.value) || 0;

			const divider = parseInt(dice.split('/')[1]) || 1;
			const split = value.split('D');

			if (split.length === 1)
				dice = Math.floor((parseInt(split[0]) + modifier) / divider).toString();
			else dice = `${split[0]}D${Math.floor((parseInt(split[1]) + modifier) / divider)}`;
		}
	}

	const split = dice.split('D');
	if (split.length === 1) return { num: 0, roll: parseInt(dice) || 0 };
	return { num: parseInt(split[0]), roll: parseInt(split[1]) || 0 };
}
