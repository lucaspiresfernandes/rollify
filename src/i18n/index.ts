export interface Locale {
	locale: string;
	localeName: string;
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
	add: string;
	star: string;
	unstar: string;
	skill: string;
	default: string;
	details: string;
	player: string;
	unknown: string;
	none: string;
	trade: string;
	offering: string;

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
		unauthorized: string;
		invalidBody: string;
		playerDetailsFetchFailed: string;
	};

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
		};
	};

	admin: {
		panelTitle: string;
		editorTitle: string;
		configurationsTitle: string;

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
			numberOfDices: string;
			portraitDescription: string;
			diceColor: string;
			showDiceRoll: string;
			portraitLink: string;
			currentValue: string;
			maxValue: string;
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
	};
}
