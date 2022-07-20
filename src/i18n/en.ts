import type { Locale } from '.';

export const table: Locale = {
	locale: 'en',
	title: 'Rollify',

	search: 'Search',

	error: {
		unknown: 'An unknown error has occurred: {{message}}',
		credentials: {
			email_already_used: 'Email already registered',
			invalid_admin_key: 'Invalid GM key',
			invalid_credentials: 'Invalid username or password',
			empty_password: 'Empty password',
			password_mismatch: 'Passwords do not match',
			invalid_email: 'Invalid email',
		},
	},

	login: {
		title: 'Sign In',
		password: 'Password',
		loginButton: 'Sign In',
		register: "Don't have an account? Register",
	},

	register: {
		title: 'Register',
		password: 'Password',
		confirmPassword: 'Confirm password',
		adminKey: "GM's key",
		adminKeyDisabled: 'The GM key is disabled for the first registration of GM.',
		registerButton: 'Register',
		login: 'Already got an account? Sign in',
		registerAsPlayer: 'Are you a player? Register as a player',
		registerAsAdmin: 'Are you the GM? Register as a GM',
	},

	sheet: {
		playerTitle: 'Character Sheet',
		npcTitle: 'NPC Sheet',
		playerInfoTitle: 'Personal Details',
		playerCharacteristicTitle: 'Characteristics',
		playerSkillTitle: 'Skills',
		playerCombatTitle: 'Combat',
		playerItemTitle: 'Items',
		playerSpellTitle: 'Spells',
		clearMarkers: 'Clear Markers',
		attributePoints: '{{name}} Points',

		equipment: {
			name: 'Name',
			type: 'Type',
			damage: 'Damage',
			range: 'Range',
			attacks: 'Attacks',
			currentAmmo: 'Cur. Ammo',
			ammo: 'Max Ammo',
		},
	},
};
