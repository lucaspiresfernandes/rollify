import { evaluate } from 'mathjs';
import type { RosettaExtended } from 'next-rosetta';
import type { Locale } from '../i18n';

export type RelationalOperator =
	| 'any'
	| 'equals'
	| 'notEquals'
	| 'greaterThan'
	| 'lessThan'
	| 'greaterThanOrEquals'
	| 'lessThanOrEquals';

const comparer = new Map<RelationalOperator, (a: number, b: number) => boolean>([
	['any', () => true],
	['equals', (a, b) => a === b],
	['notEquals', (a, b) => a !== b],
	['greaterThan', (a, b) => a > b],
	['lessThan', (a, b) => a < b],
	['greaterThanOrEquals', (a, b) => a >= b],
	['lessThanOrEquals', (a, b) => a <= b],
]);

export type DiceResultResolver = {
	operator: RelationalOperator;
	result: string;
	description: string;
}[];

export type DiceConfig = {
	baseDice: number;
	resolver: DiceResultResolver | null;
	characteristic: { enableModifiers: boolean };
	skill: { enableModifiers: boolean };
};

export function getDiceResultDescription(
	config: DiceResultResolver,
	diceRoll: number,
	diceResult: number
) {
	for (const con of config) {
		try {
			const result = evaluate(con.result.replace(/({value})|({valor})/g, diceRoll.toString()));

			if (typeof result !== 'number')
				throw new Error('Result is not a number: ' + result.toString());

			const compare = comparer.get(con.operator);
			if (compare && compare(diceResult, result)) return con.description;
		} catch (err) {
			console.warn('Error evaluating dice result:', err);
			continue;
		}
	}
	return 'Unknown';
}

export type ResolvedDice = {
	num: number;
	roll: number;
};

export type DiceRequest = { num?: number; mod?: number; ref: number } | ResolvedDice[];

export type DiceResponse = {
	roll: number;
	description?: string;
};

export function resolveDices(dices: string, t: RosettaExtended<Locale>['t']) {
	let formattedDiceString = dices.replace(/\s/g, '').toUpperCase();

	const options = formattedDiceString.split('|');

	if (options.length > 1) {
		const selected = prompt(
			t('prompt.diceSelect') + '\n' + options.map((opt, i) => `${i + 1}: ${opt}`).join('\n')
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
	const utilMatch = dice.match(/[A-Z][A-Z][A-Z]/);
	const utilModMatch = dice.match(/MOD\([A-Z][A-Z][A-Z]\)/);

	if (utilMatch || utilModMatch) {
		let utilName = '';
		if (utilModMatch) utilName = `diceUtilMod${utilModMatch[0].replace(/MOD\(|\)/g, '')}`;
		else if (utilMatch) utilName = `diceUtil${utilMatch[0]}`;

		const utilElement = (
			document.getElementsByName(utilName) as NodeListOf<HTMLInputElement>
		)[0] as HTMLInputElement | undefined;

		if (utilElement) {
			const utilElementModifier: HTMLInputElement | undefined = utilMatch
				? (
						document.getElementsByName(`diceUtilMod${utilMatch[0]}`) as NodeListOf<HTMLInputElement>
				  )[0]
				: undefined;

			const value = resolveDice(utilElement.value.replace(/\s/g, '').toUpperCase());

			let modifier = 0;
			if (utilElementModifier) modifier = parseInt(utilElementModifier.value) || 0;

			const divider = parseInt(dice.split('/')[1]) || 1;

			return {
				num: value.num,
				roll: Math.floor((value.roll + modifier) / divider),
			};
		}
	}

	const split = dice.split('D');

	if (split.length === 1) return { num: 0, roll: parseInt(dice) || 0 };
	return { num: parseInt(split[0]) || 0, roll: parseInt(split[1]) || 0 };
}
