export type PortraitConfig = {
	customFont: {
		name: string;
		data: string;
	};
	typography: {
		italic: boolean;
	};
	dice: {
		timeout: number;
	};
};

export type PortraitFontConfig = {
	name: string;
	data: string;
};

export type Environment = 'idle' | 'combat';

export function getShadowStyle(color: string) {
	return {
		textShadow: `0 0 10px #${color}, 0 0 30px #${color}, 0 0 50px #${color}`,
	};
}
