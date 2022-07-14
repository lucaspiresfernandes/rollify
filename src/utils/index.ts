export const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function clamp(num: number, min: number, max: number) {
	if (num < min) return min;
	if (num > max) return max;
	return num;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms));
}
