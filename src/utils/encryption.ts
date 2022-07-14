import bcrypt from 'bcrypt';
const saltRounds = 10;

export function hash(plainPassword: string) {
	const salt = bcrypt.genSaltSync(saltRounds);
	return bcrypt.hashSync(plainPassword, salt);
}

export function compare(plainPassword: string, hashword: string) {
	return bcrypt.compareSync(plainPassword, hashword);
}
