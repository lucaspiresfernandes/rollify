export type PortraitConfig = {
	customFont: {
		name: string;
		data: string;
	} | null;

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

export const DEFAULT_PORTRAIT_CONFIG: PortraitConfig = {
	customFont: null,
	typography: {
		attribute: {
			fontSize: 108,
			italic: true,
		},
		name: {
			fontSize: 96,
			italic: true,
		},
		dice: {
			result: {
				fontSize: 96,
				italic: false,
			},
			description: {
				fontSize: 72,
				italic: false,
			},
		},
	},
	transitions: {
		dice: {
			enterTimeout: 750,
			screenTimeout: 1500,
			exitTimeout: 500,
		},
	},
};

export type Environment = 'idle' | 'combat';
