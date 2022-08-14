import type { RelationalOperator } from '../utils/dice';

export interface Locale {
	locale: string;
	title: string;

	search: string;
	orientation: string;
	delete: string;
	erase: string;
	round: string;
	previous: string;
	reset: string;
	next: string;
	simple: string;
	advanced: string;
	access: string;
	portrait: string;
	hide: string;
	show: string;
	quickAccess: string;
	currentWeight: string;
	availableSlots: string;
	enable: string;
	disable: string;
	armor: string;
	weapon: string;
	subtract: string;
	add: string;
	star: string;
	unstar: string;
	skill: string;
	default: string;
	details: string;
	player: string;
	unknown: string;
	none: string;
	primary: string;
	secondary: string;
	trade: string;
	offering: string;
	load: string;
	slots: string;
	clear: string;
	update: string;
	expand: string;
	collapse: string;
	accept: string;
	reject: string;
	preset: string;
	for: string;
	to: string;
	name: string;

	placeholder: {
		noFavouriteSkills: string;
	};

	theme: {
		light: string;
		system: string;
		dark: string;
	};

	operation: {
		[T in RelationalOperator]: string;
	};

	nav: {
		language: string;
		exit: string;

		player: {
			firstPage: string;
			secondPage: string;
		};

		admin: {
			panel: string;
			editor: string;
			configurations: string;
			mode: string;
			language: string;
		};
	};

	error: {
		unknown: string;
		credentials: {
			email_already_used: string;
			invalid_admin_key: string;
			invalid_credentials: string;
			empty_password: string;
			password_mismatch: string;
			invalid_email: string;
		};
		boot: {
			title: string;
			helper: string;
		};
		unauthorized: string;
		invalidBody: string;
		updateFailed: string;
		playerDetailsFetchFailed: string;
	};

	boot: {
		title: string;
		selectPreset: string;
	}

	login: {
		title: string;
		password: string;
		loginButton: string;
		register: string;
	};

	register: {
		title: string;
		password: string;
		confirmPassword: string;
		adminKey: string;
		adminKeyDisabled: string;
		registerButton: string;
		login: string;
		registerAsPlayer: string;
		registerAsAdmin: string;
	};

	sheet: {
		playerTitle: string;
		npcTitle: string;
		playerInfoTitle: string;
		playerCharacteristicTitle: string;
		playerSkillTitle: string;
		playerCombatTitle: string;
		playerItemTitle: string;
		playerSpellTitle: string;
		playerNotesTitle: string;
		playerExtraInfoTitle: string;
		clearMarkers: string;
		attributePoints: string;

		table: {
			name: string;
			type: string;
			damage: string;
			range: string;
			attacks: string;
			currentAmmo: string;
			ammo: string;

			description: string;
			weight: string;
			quantity: string;

			damageReduction: string;
			penalty: string;

			cost: string;
			target: string;
			castingTime: string;
			duration: string;
			slots: string;

			color: string;
			rollable: string;
			portrait: string;

			attribute: string;

			specialization: string;
			startValue: string;

			visible: string;
		};
	};

	admin: {
		panelTitle: string;
		editorTitle: string;
		configurationsTitle: string;

		enableCombatEnvironment: string;

		editor: {
			weapon: string;
			armor: string;
			attribute: string;
			attributeStatus: string;
			characteristic: string;
			currency: string;
			info: string;
			extraInfo: string;
			item: string;
			skill: string;
			spell: string;
			spec: string;
			specialization: string;
			hasAmmo: string;
		};

		info: {
			noPlayers: string;
		};
	};

	modal: {
		title: {
			generalDiceRoll: string;
			rollDice: string;
			playerPortrait: string;
			addData: string;
			attributeEditor: string;
			avatarEditor: string;
		};
		label: {
			avatarRules: string;
			numberOfDices: string;
			portraitDescription: string;
			diceColor: string;
			showDiceRoll: string;
			portraitLink: string;
			currentValue: string;
			maxValue: string;
			extraValue: string;
		};
		close: string;
		cancel: string;
		apply: string;
		roll: string;
		rollAgain: string;
	};

	prompt: {
		delete: string;
		linkCopied: string;
		linkCopyFailed: string;
		addNpcName: string;
		removeNpc: string;
		noAmmo: string;
		diceSelect: string;

		tradeRequest: {
			offeredYou: string;
			inExchangeFor: string;
			accept: string;
		};
		tradeCanceled: string;
		tradeAccepted: string;
		tradeRejected: string;

		invalidAvatar: string;

		noItemsFound: string;

		noPlayersFound: string;
	};

	settings: {
		general: {
			adminKey: string;
			adminKeyDescription: string;
		};
		dice: {
			baseDice: string;
			baseDiceDescription: string;
			enableResolvers: string;
			addResolver: string;
			resolver: {
				when: string;
				then: string;
			};
			resolverRules: string;
			enableCharacteristicModifiers: string;
			enableSkillModifiers: string;
		};
		portrait: {
			customFont: string;
			currentFont: string;
			uploadFont: string;
			typography: string;
			diceResultFontSize: string;
			diceResultFontItalic: string;
			diceDescriptionFontSize: string;
			diceDescriptionFontItalic: string;
			nameFontSize: string;
			nameFontItalic: string;
			attributeFontSize: string;
			attributeFontItalic: string;
			transitions: string;
			diceEnterTimeout: string;
			diceScreenTime: string;
			diceExitTimeout: string;
		};
	};
}
