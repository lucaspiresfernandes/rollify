import { sleep } from '../../utils';
import type { DiceRequest, DiceResponse } from '../../utils/dice';
import type { NextApiHandlerIO, NextApiResponseData } from '../../utils/next';
import prisma from '../../utils/prisma';
import { withSessionApi } from '../../utils/session';

export type DiceApiResponse = NextApiResponseData<
	'unauthorized' | 'invalid_dices',
	{ results: DiceResponse[] }
>;

function nextInt(min: number, max: number, n: number) {
	const data = [];

	min = Math.ceil(min);
	max = Math.floor(max);

	for (let i = 0; i < n; i++) data.push(Math.floor(Math.random() * (max - min + 1) + min));

	return data;
}

async function getRandom(min: number, max: number, n: number) {
	await sleep(nextInt(600, 1000, 1)[0]);
	return nextInt(min, max, n);
}

const handler: NextApiHandlerIO<DiceApiResponse> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const player = req.session.player;
	const npcId: number | undefined = req.body.npcId;

	if (!player) return res.json({ status: 'failure', reason: 'unauthorized' });

	const dices: DiceRequest = req.body.dices;

	const playerId = npcId ? npcId : player.id;

	try {
		const successTypeEnabled =
			(
				await prisma.config.findUnique({
					where: { name: 'enable_success_types' },
				})
			)?.value === 'true';

		if (!dices) {
			return res.json({
				status: 'failure',
				reason: 'invalid_dices',
			});
		}

		const io = res.socket.server.io;

		io?.to(`portrait${playerId}`).emit('diceRoll');

		let results: Array<DiceResponse>;

		if (Array.isArray(dices)) {
			results = new Array(dices.length);
			await Promise.all(
				dices.map((dice, index) => {
					const numDices = dice.num;
					const roll = dice.roll;

					if (!numDices || roll < 1) {
						results[index] = { roll };
						return;
					}

					if (roll === 1) {
						results[index] = { roll: numDices };
						return;
					}

					return getRandom(numDices, numDices * roll, 1).then(
						(data) => (results[index] = { roll: data[0] })
					);
				})
			);
		} else {
			results = new Array(dices.num);
			const numDices = dices.num;
			const roll = dices.roll;
			const reference = dices.ref;
			const branched = dices.branched;

			if (!numDices || roll < 1) {
				res.json({ status: 'success', results: [{ roll }] });
				return;
			}

			if (roll === 1) {
				res.json({ status: 'success', results: [{ roll: numDices }] });
				return;
			}

			const data = await getRandom(1, roll, numDices);

			for (let index = 0; index < data.length; index++) {
				const result = data[index];
				results[index] = { roll: result };
				if (reference === undefined || !successTypeEnabled) continue;
				results[index].resultType = resolveSuccessType(reference, result, branched);
			}
		}

		res.json({ status: 'success', results });

		if (!player.admin) io.to('admin').emit('diceResult', playerId, results, dices);
		io.to(`portrait${playerId}`).emit('diceResult', playerId, results, dices);
	} catch (err) {
		console.error(err);
		res.json({ status: 'failure', reason: 'unknown_error' });
	}
};

function resolveSuccessType(
	reference: number,
	roll: number,
	branched?: boolean
): DiceResponse['resultType'] {
	let successType = { description: '', successWeight: 0 };

	switch (roll) {
		case 20:
			if (roll > 20 - Math.floor(reference * 0.2))
				successType = {
					description: 'Extremo',
					successWeight: 2,
				};
			if (roll > 20 - Math.floor(reference * 0.5))
				successType = {
					description: 'Bom',
					successWeight: 1,
				};
			if (roll > 20 - reference)
				successType = {
					description: 'Sucesso',
					successWeight: 0,
				};
			successType = {
				description: 'Fracasso',
				successWeight: -1,
			};
			break;
		case 100:
			if (roll <= Math.floor(reference * 0.2))
				successType = {
					description: 'Extremo',
					successWeight: 2,
				};
			if (roll <= Math.floor(reference * 0.5))
				successType = {
					description: 'Bom',
					successWeight: 1,
				};
			if (roll <= reference)
				successType = {
					description: 'Sucesso',
					successWeight: 0,
				};
			successType = {
				description: 'Fracasso',
				successWeight: -1,
			};
			break;
		default:
			return;
	}

	if (!branched) successType.description = successType.successWeight >= 0 ? 'Sucesso' : 'Fracasso';

	return successType;
}

export default withSessionApi(handler);
