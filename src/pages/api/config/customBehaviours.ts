import type { DiceConfig } from '../../../utils/dice';
import type { Environment } from '../../../utils/portrait';
import prisma from '../../../utils/prisma';
import type { NextApiResponseServerIO } from '../../../utils/socket';

type CustomBehaviourHandler<T = any> = (
	res: NextApiResponseServerIO,
	value: T
) => unknown | Promise<unknown>;

const onEnvironmentChange: CustomBehaviourHandler<Environment> = (res, value) =>
	res.socket.server.io.emit('environmentChange', value);

const onDiceChange: CustomBehaviourHandler<DiceConfig> = async (_, value) => {
	if (!value.characteristic.enableModifiers) {
		await prisma.playerCharacteristic.updateMany({
			where: { modifier: { not: 0 } },
			data: { modifier: 0 },
		});
	}

	if (!value.skill.enableModifiers) {
		await prisma.playerSkill.updateMany({
			where: { modifier: { not: 0 } },
			data: { modifier: 0 },
		});
	}
};

const customBehaviours = new Map<string, CustomBehaviourHandler>([
	['environment', onEnvironmentChange],
	['dice', onDiceChange],
]);

export default customBehaviours;
