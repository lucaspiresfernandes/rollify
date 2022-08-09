export type PortraitConfig = {
	customFont?: {
		name: string;
		data: string;
	};

	typography: {
		name: {
			fontSize: number;
			italic: boolean;
		};

		attribute: {
			fontSize: number;
			italic: boolean;
		};

		dice: {
			result: {
				fontSize: number;
				italic: boolean;
			};
			description: {
				fontSize: number;
				italic: boolean;
			};
		};
	};

	transitions: {
		dice: {
			enterTimeout: number;
			screenTimeout: number;
			exitTimeout: number;
		};
	};
};

export type Environment = 'idle' | 'combat';

export function getShadowStyle(color: string) {
	return {
		textShadow: `0 0 10px #${color}, 0 0 30px #${color}, 0 0 50px #${color}`,
	};
}
