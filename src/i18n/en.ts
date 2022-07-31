import type { Locale } from '.';

export const table: Locale = {
	locale: 'en',
	title: 'Rollify',

	search: 'Search',
	orientation: 'Orientation',
	delete: 'Delete',
	erase: 'Erase',
	round: 'Round',
	previous: 'Previous',
	reset: 'Reset',
	next: 'Next',
	simple: 'Simple',
	advanced: 'Advanced',
	access: 'Access',
	portrait: 'Portrait',
	hide: 'Hide',
	show: 'Show',
	availableSlots: 'Available Slots',
	currentWeight: 'Current Weight',
	enable: 'Enable',
	disable: 'Disable',
	armor: 'Armor',
	weapon: 'Weapon',
	add: 'Add',
	star: 'Star',
	unstar: 'Unstar',
	skill: 'Skill',
	default: 'Default',
	details: 'Details',
	player: 'Player',

	quickAccess: 'Quick Access',

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
		invalidBody: 'Unable to update character information. Try again later.',
		unauthorized: 'Unable to update character information. Try to relogin.',
		playerDetailsFetchFailed: 'Failed to fetch player details.',
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

			damageReduction: 'Dam. Reduction',
			penalty: 'Penalty',
		},
	},

	admin: {
		panelTitle: "GM's Panel",
		editorTitle: "GM's Editor",
		configurationsTitle: 'Settings',

		info: {
			noPlayers: 'All registered players will be listed here.',
		},
	},

	modal: {
		title: {
			generalDiceRoll: 'General Dice Roll',
			rollDice: 'Roll Dices',
			playerPortrait: 'Player Portrait',
			addData: 'Add Data',
			attributeEditor: 'Attribute Editor',
			avatarEditor: 'Avatar Editor',
		},
		label: {
			numberOfDices: 'Dice Number',
			portraitDescription: 'Portrait description',
			diceColor: 'Dice color',
			portraitLink: 'Portrait link',
			showDiceRoll: 'Show dice roll',
			currentValue: 'Current value',
			maxValue: 'Max value',
		},
		close: 'Close',
		cancel: 'Cancel',
		apply: 'Apply',
		roll: 'Roll',
		rollAgain: 'Roll Again',
	},

	prompt: {
		delete: 'Are you sure you want to delete this {{name}}?',
		linkCopied: 'Link copied to clipboard.',
		linkCopyFailed: 'Failed to copy link. Please, manually copy it.',
		addNpcName: 'Enter the NPC name:',
		removeNpc: 'Are you sure you want to remove this NPC?',
		noAmmo: 'You do not have enough ammo.',
	},
};
