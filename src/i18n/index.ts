export interface Locale {
	locale: string;
	title: string;

	search: string;

	quickAccess: string;

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
	}

	modal: {
		close: string;
		cancel: string;
		apply: string;
		roll: string;
		rollAgain: string;
	}

	prompt: {
		delete: string;
	};
}
