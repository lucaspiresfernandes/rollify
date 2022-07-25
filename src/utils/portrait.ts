export type PortraitFontConfig = {
	name: string;
	data: string;
};

export type Environment = 'idle' | 'combat';

export const portraitEnvironmentOrientation = ['Esquerda', 'Direita'] as const;

export function getAttributeStyle(color: string) {
	return {
		color: 'white',
		textShadow: `0 0 10px #${color}, 0 0 30px #${color}, 0 0 50px #${color}`,
	};
}
