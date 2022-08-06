export type RelationalOperator =
	| 'equals'
	| 'notEquals'
	| 'greaterThan'
	| 'lessThan'
	| 'greaterThanOrEquals'
	| 'lessThanOrEquals';

const comparer = new Map<RelationalOperator, (a: number, b: number) => boolean>([
	['equals', (a, b) => a === b],
	['notEquals', (a, b) => a !== b],
	['greaterThan', (a, b) => a > b],
	['lessThan', (a, b) => a < b],
	['greaterThanOrEquals', (a, b) => a >= b],
	['lessThanOrEquals', (a, b) => a <= b],
]);

type DiceResultResolver = {
	operator: RelationalOperator;
	result: string | number;
	description: string;
}[];

export type DiceConfig = {
	baseDice: number;
	resolver: DiceResultResolver | null;
	characteristic: { enable_modifiers: boolean };
	skill: { enable_modifiers: boolean };
};

export function getDiceResultDescription(
	config: DiceResultResolver,
	diceRoll: number,
	diceResult: number
) {
	for (const con of config) {
		const result =
			typeof con.result === 'string'
				? (eval(con.result.replace(/({result})|({resultado})/g, diceRoll.toString())) as number)
				: con.result;
		const compare = comparer.get(con.operator) as NonNullable<ReturnType<typeof comparer.get>>;
		if (compare(diceResult, result)) return con.description;
	}
	return 'Unknown';
}

export type ResolvedDice = {
	num: number;
	roll: number;
};

export type DiceRequest = { num?: number; ref: number } | ResolvedDice[];

export type DiceResponse = {
	roll: number;
	description?: string;
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
	return { num: parseInt(split[0]) || 0, roll: parseInt(split[1]) || 0 };
}
