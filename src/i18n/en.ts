import type { Locale } from '.';

export const table: Locale = {
	locale: 'en',
	title: 'Rollify',

	search: 'Search',

	nav: {
		language: 'Language',
		exit: 'Logout',

		player: {
			firstPage: 'Page 1',
			secondPage: 'Page 2',
		},
		admin: {
			panel: 'Panel',
			editor: 'Editor',
			configurations: 'Configurations',
		},
	},

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
		playerNotesTitle: 'Annotations',
		playerExtraInfoTitle: 'Personal Details (Extra)',
		clearMarkers: 'Clear Markers',
		attributePoints: '{{name}} Points',

		table: {
			name: 'Name',
			type: 'Type',
			damage: 'Damage',
			range: 'Range',
			attacks: 'Attacks',
			currentAmmo: 'Cur. Ammo',
			ammo: 'Max Ammo',

			description: 'Description',
			weight: 'Weight',
			quantity: 'Quantity',
		},
	},

	admin: {
		panelTitle: 'GM\'s Panel',
		editorTitle: 'GM\'s Editor',
		configurationsTitle: 'Settings',
	},

	modal: {
		close: 'Close',
		cancel: 'Cancel',
		apply: 'Apply',
		roll: 'Roll',
		rollAgain: 'Roll Again',
	},

	prompt: {
		delete: 'Are you sure you want to delete this {{name}}?',
	},
};
