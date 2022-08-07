export type PortraitFontConfig = {
	name: string;
	data: string;
};

export type Environment = 'idle' | 'combat';

export function getAttributeStyle(color: string) {
	return {
		textShadow: `0 0 10px #${color}, 0 0 30px #${color}, 0 0 50px #${color}`,
	};
}
