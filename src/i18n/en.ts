import type { Locale } from '.';

export const table: Locale = {
	locale: 'en',
	title: 'Rollify',

	search: 'Search...',
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
	subtract: 'Subtract',
	star: 'Star',
	unstar: 'Unstar',
	skill: 'Skill',
	default: 'Default',
	details: 'Details',
	player: 'Player',
	unknown: 'Unknown',
	none: 'None',
	primary: 'Primary',
	secondary: 'Secondary',
	trade: 'Trade',
	offering: 'Offering',
	load: 'Current Load',
	slots: 'Available Slots',
	quickAccess: 'Q.A.',
	clear: 'Clear',
	update: 'Update',
	expand: 'Expand',
	collapse: 'Collapse',
	accept: 'Accept',
	reject: 'Reject',
	preset: 'Preset',
	for: 'For',
	to: 'To',
	name: 'Name',
	copy: 'Copy',
	no: 'No',

	placeholder: {
		noFavouriteSkills: 'Your favourite skills will appear here.',
	},

	theme: {
		light: 'Light',
		system: 'System',
		dark: 'Dark',
	},

	operation: {
		any: 'Any',
		equals: 'Equals',
		notEquals: 'Not equals',
		greaterThan: 'Greater than',
		lessThan: 'Less than',
		greaterThanOrEquals: 'Greater than or equals',
		lessThanOrEquals: 'Less than or equals',
	},

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
			configurations: 'Settings',
			mode: 'Mode',
			language: 'Language',
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
		boot: {
			title: 'Error',
			helper: 'Please contact the administrator.',
		},
		updateFailed: 'Update failed. Please try again later.',
		invalidBody: 'Unable to update character information. Try again later.',
		unauthorized: 'Unable to update character information. Try to relogin.',
		playerDetailsFetchFailed: 'Failed to fetch player details.',
	},

	boot: {
		title: 'Welcome to Rollify!',
		selectPreset: 'Select a preset',
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
		playerCharacteristicTitle: 'Abilities',
		playerSkillTitle: 'Skills',
		playerCombatTitle: 'Combat',
		playerItemTitle: 'Items',
		playerCurrencyTitle: 'Currency',
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
			ammo: 'Ammo',

			description: 'Description',
			weight: 'Weight',
			quantity: 'Quantity',

			damageReduction: 'Dam. Reduction',
			penalty: 'Penalty',

			castingTime: 'Casting Time',
			cost: 'Cost',
			duration: 'Duration',
			target: 'Target',
			slots: 'Slots',

			color: 'Color',
			rollable: 'Rollable',
			portrait: 'Portrait',

			attribute: 'Attribute',

			startValue: 'Start Value',

			visible: 'Visible',
		},
	},

	admin: {
		panelTitle: "GM's Panel",
		editorTitle: "GM's Editor",
		configurationsTitle: 'Settings',

		enableCombatEnvironment: 'Enable combat environment',

		editor: {
			armor: 'Armor',
			weapon: 'Weapons',
			skill: 'Skills',
			spell: 'Spells',
			item: 'Items',
			currency: 'Currencies',
			attribute: 'Attributes',
			attributeStatus: 'Character Status',
			characteristic: 'Abilities',
			extraInfo: 'Extra Info',
			info: 'Info',
			spec: 'Specs',
			hasAmmo: 'Has ammo?',
		},

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
			characterDetails: 'Character Details',
		},
		label: {
			numberOfDices: 'Dice Number',
			portraitDescription: 'Portrait Description',
			diceColor: 'Dice Color (in hexadecimal)',
			portraitLink: 'Portrait Link',
			showDiceRoll: 'Show Dice Roll',
			currentValue: 'Current Value',
			maxValue: 'Max Value',
			extraValue: 'Extra Value',
			avatarRules: 'Avatar Rules',
			environmentLabel: 'Lock Environment',
			environment: {
				idle: 'Idle',
				combat: 'Combat',
			},
		},
		close: 'Close',
		create: 'Create',
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
		noAmmo: 'You do not have enough ammo.',
		diceSelect: 'Select dice to roll:',

		tradeRequest: {
			offeredYou: 'offered you',
			inExchangeFor: 'in exchange for',
			accept: 'Do you wish to accept this offer?',
		},
		tradeAccepted: 'The trade was accepted.',
		tradeRejected: 'The trade was rejected.',
		tradeCanceled: 'Trade has already been canceled.',

		invalidAvatar: 'Avatar "{{name}}" is invalid.',

		noItemsFound: 'No items found.',

		noPlayersFound: 'No players found.',
	},

	settings: {
		general: {
			adminKey: 'GM key',
			adminKeyDescription: 'The GM key is used to create a new admin account.',
			section: 'Sections',
			sectionDescription:
				'The sections are the information blocks that are displayed on the character sheet.',
			sectionField: '{{name}} Section',
		},
		dice: {
			addResolver: 'Add resolver',
			baseDice: 'Base dice',
			baseDiceDescription:
				'The base dice is the main dice used to roll abilities, attributes and skills.',
			enableCharacteristicModifiers: 'Enable ability modifiers',
			enableResolvers: 'Enable resolvers',
			enableSkillModifiers: 'Enable skill modifiers',
			resolver: {
				when: 'When',
				result: 'result',
				resultWithModifier: 'result with modifiers',
				is: 'is',
				then: ', then the description will be',
			},
			resolverRules: 'You can use the syntax "{value}" to refer to the value of the tested field.',
		},
		portrait: {
			attributeFontItalic: 'Attribute font italic',
			attributeFontSize: 'Attribute font size',
			currentFont: 'Current font',
			customFont: 'Custom font',
			diceDescriptionFontItalic: 'Dice description font italic',
			diceDescriptionFontSize: 'Dice description font size',
			diceEnterTimeout: 'Dice enter timeout',
			diceExitTimeout: 'Dice exit timeout',
			diceResultFontItalic: 'Dice result font italic',
			diceResultFontSize: 'Dice result font size',
			diceScreenTime: 'Dice screen time',
			nameFontItalic: 'Name font italic',
			nameFontSize: 'Name font size',
			transitions: 'Transitions',
			typography: 'Typography',
			uploadFont: 'Upload font',
		},
	},
};
