import type { DiceConfig } from '../../../utils/dice';
import prisma from '../../../utils/prisma';
import type { NextApiResponseServerIO } from '../../../utils/socket';

type CustomBehaviourHandler = (
	res: NextApiResponseServerIO,
	value: any
) => unknown | Promise<unknown>;

const onEnvironmentChange: CustomBehaviourHandler = (res, value) =>
	res.socket.server.io.emit('environmentChange', value);

const onDiceChange: CustomBehaviourHandler = async (_, value: DiceConfig) => {
	if (!value.characteristic.enable_modifiers) {
		await prisma.playerCharacteristic.updateMany({
			where: { modifier: { not: 0 } },
			data: { modifier: 0 },
		});
	}

	if (!value.skill.enable_modifiers) {
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
