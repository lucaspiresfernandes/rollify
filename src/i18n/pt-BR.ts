import type { Locale } from '.';

export const table: Locale = {
	locale: 'pt-BR',
	title: 'Rollify',

	search: 'Buscar...',
	orientation: 'Orientação',
	delete: 'Excluir',
	erase: 'Apagar',
	round: 'Rodada',
	previous: 'Anterior',
	reset: 'Resetar',
	next: 'Próximo',
	simple: 'Simples',
	advanced: 'Avançado',
	access: 'Acessar',
	portrait: 'Retrato',
	hide: 'Ocultar',
	show: 'Mostrar',
	availableSlots: 'Slots Disponíveis',
	currentWeight: 'Peso Atual',
	enable: 'Habilitar',
	disable: 'Desabilitar',
	weapon: 'Arma',
	armor: 'Armadura',
	add: 'Adicionar',
	subtract: 'Subtrair',
	star: 'Favoritar',
	unstar: 'Desfavoritar',
	skill: 'Perícia',
	default: 'Padrão',
	details: 'Detalhes',
	player: 'Jogador',
	unknown: 'Desconhecido',
	none: 'Nenhum',
	primary: 'Primário',
	secondary: 'Secundário',
	trade: 'Trocar',
	offering: 'Oferecendo',
	load: 'Carga Atual',
	slots: 'Slots Disponíveis',
	quickAccess: 'Acesso Rápido',
	clear: 'Limpar',
	update: 'Atualizar',
	expand: 'Expandir',
	collapse: 'Recolher',
	accept: 'Aceitar',
	reject: 'Rejeitar',
	preset: 'Predefinição',
	for: 'Por',
	to: 'Para',
	name: 'Nome',

	placeholder: {
		noFavouriteSkills: 'Suas perícias favoritadas aparecerão aqui.',
	},

	theme: {
		light: 'Claro',
		system: 'Sistema',
		dark: 'Escuro',
	},

	operation: {
		equals: 'Igual a',
		notEquals: 'Diferente de',
		greaterThan: 'Maior que',
		lessThan: 'Menor que',
		greaterThanOrEquals: 'Maior ou igual a',
		lessThanOrEquals: 'Menor ou igual a',
	},

	nav: {
		language: 'Idioma',
		exit: 'Sair',

		player: {
			firstPage: 'Página 1',
			secondPage: 'Página 2',
		},
		admin: {
			panel: 'Painel',
			editor: 'Editor',
			configurations: 'Configurações',
			mode: 'Modo',
			language: 'Idioma',
		},
	},

	error: {
		unknown: 'Ocorreu um erro desconhecido: {{message}}',
		credentials: {
			email_already_used: 'Email já cadastrado',
			invalid_admin_key: 'Chave de mestre inválida',
			invalid_credentials: 'Usuário ou senha inválidos',
			empty_password: 'Senha vazia',
			password_mismatch: 'Senhas não conferem',
			invalid_email: 'Email inválido',
		},
		boot: {
			title: 'Erro de inicialização',
			helper: 'Por favor, tente novamente mais tarde.',
		},
		updateFailed: 'Falha ao atualizar',
		invalidBody:
			'Não foi possível atualizar as informações do personagem. Se esse erro persistir, entre em contato com o desenvolvedor.',
		unauthorized: 'Não foi possível atualizar as informações do personagem. Tente relogar.',
		playerDetailsFetchFailed: 'Falha ao carregar os detalhes do jogador.',
	},

	boot: {
		title: 'Bem-vindo ao Rollify',
		selectPreset: 'Selecione uma predefinição',
	},

	login: {
		title: 'Entrar',
		password: 'Senha',
		loginButton: 'Entrar',
		register: 'Não possui uma conta? Registrar-se',
	},

	register: {
		title: 'Registrar',
		password: 'Senha',
		confirmPassword: 'Confirmar senha',
		adminKey: 'Chave do mestre',
		adminKeyDisabled: 'A chave do mestre é desativada para o primeiro cadastro de mestre.',
		registerButton: 'Registrar',
		login: 'Já possui uma conta? Entrar',
		registerAsPlayer: 'Você é um jogador? Registrar-se como jogador',
		registerAsAdmin: 'Você é o mestre? Registrar-se como mestre',
	},

	sheet: {
		playerTitle: 'Ficha de Personagem',
		npcTitle: 'Ficha de NPC',
		playerInfoTitle: 'Detalhes Pessoais',
		playerCharacteristicTitle: 'Habilidades',
		playerSkillTitle: 'Perícias',
		playerCombatTitle: 'Combate',
		playerItemTitle: 'Itens',
		playerCurrencyTitle: 'Moedas',
		playerSpellTitle: 'Magias',
		playerNotesTitle: 'Anotações',
		playerExtraInfoTitle: 'Detalhes Pessoais (Extras)',
		clearMarkers: 'Limpar Marcadores',
		attributePoints: 'Pontos de {{name}}',

		table: {
			name: 'Nome',
			type: 'Tipo',
			damage: 'Dano',
			range: 'Alcance',
			attacks: 'Ataques',
			currentAmmo: 'Mun. atual',
			ammo: 'Munição',

			description: 'Descrição',
			weight: 'Peso',
			quantity: 'Quantidade',

			damageReduction: 'Redução de dano',
			penalty: 'Penalidade',

			castingTime: 'Tempo de Conjuração',
			cost: 'Custo',
			duration: 'Duração',
			target: 'Alvo',
			slots: 'Slots',

			color: 'Cor',
			rollable: 'Rolável',
			portrait: 'Retrato',

			attribute: 'Atributo',

			startValue: 'Valor inicial',

			visible: 'Visível',
		},
	},

	admin: {
		panelTitle: 'Painel do Mestre',
		editorTitle: 'Editor',
		configurationsTitle: 'Configurações',

		enableCombatEnvironment: 'Habilitar ambiente de combate',

		editor: {
			armor: 'Armaduras',
			weapon: 'Armas',
			attribute: 'Atributos',
			attributeStatus: 'Status de Personagem',
			characteristic: 'Habilidades',
			skill: 'Perícias',
			spell: 'Magias',
			item: 'Itens',
			currency: 'Moedas',
			extraInfo: 'Detalhes Pessoais (Extras)',
			info: 'Detalhes Pessoais',
			spec: 'Especificações de Personagem',
			hasAmmo: 'Possui munição',
		},

		info: {
			noPlayers: 'Todos os jogadores cadastrados aparecerão aqui.',
		},
	},

	modal: {
		title: {
			generalDiceRoll: 'Rolagem Geral de Dados',
			rollDice: 'Rolar Dados',
			playerPortrait: 'Retrato de Jogador',
			addData: 'Adicionar Dados',
			attributeEditor: 'Editor de Atributo',
			avatarEditor: 'Editor de Avatar',
			characterDetails: 'Detalhes do Personagem',
		},
		label: {
			numberOfDices: 'Número de Dados',
			portraitDescription: 'Descrição',
			diceColor: 'Cor dos Dados (em hexadecimal)',
			portraitLink: 'Link do Retrato',
			showDiceRoll: 'Mostrar Rolagem de dados',
			currentValue: 'Valor Atual',
			maxValue: 'Valor Máximo',
			extraValue: 'Valor Extra',
			avatarRules: 'Regras do Avatar',
			environmentLabel: 'Travar Ambiente',
			environment: {
				idle: 'Idle',
				combat: 'Combate',
			},
		},
		close: 'Fechar',
		cancel: 'Cancelar',
		apply: 'Aplicar',
		roll: 'Rolar',
		rollAgain: 'Rolar novamente',
	},

	prompt: {
		delete: 'Tem certeza que deseja excluir esse(a) {{name}}?',
		linkCopied: 'Link copiado para a sua área de transferência.',
		linkCopyFailed:
			'O link não pôde ser copiado para sua área de transferência. Por favor, copie o link manualmente.',
		addNpcName: 'Digite o nome do NPC.',
		noAmmo: 'Você não possui munição o suficiente.',
		diceSelect: 'Selecione o dado a rolar:',

		tradeRequest: {
			offeredYou: 'te ofereceu',
			inExchangeFor: 'em troca de',
			accept: 'Você deseja aceitar essa oferta?',
		},
		tradeAccepted: 'A oferta foi aceita.',
		tradeRejected: 'A oferta foi recusada.',
		tradeCanceled: 'A oferta já foi cancelada.',

		invalidAvatar: 'O avatar "{{name}}" é inválido.',

		noItemsFound: 'Nenhum item encontrado.',

		noPlayersFound: 'Nenhum jogador encontrado.',
	},

	settings: {
		general: {
			adminKey: 'Chave do Mestre',
			adminKeyDescription: 'A chave do mestre é usada para criar uma nova conta de mestre.',
		},
		dice: {
			addResolver: 'Adicionar determinador',
			baseDice: 'Dados Base',
			baseDiceDescription:
				'O dado base é o dado principal usado para rolar habilidades, atributos e perícias.',
			enableCharacteristicModifiers: 'Habilitar Modificadores de Habilidade',
			enableResolvers: 'Habilitar Determinadores',
			enableSkillModifiers: 'Habilitar Modificadores de Perícia',
			resolver: {
				when: 'Quando',
				then: 'Então',
			},
			resolverRules:
				'Você pode usar a sintaxe "{resultado}" para referenciar o resultado da rolagem.',
		},
		portrait: {
			attributeFontItalic: 'Atributo em Itálico',
			attributeFontSize: 'Tamanho do Atributo',
			currentFont: 'Fonte Atual:',
			customFont: 'Fonte Personalizada',
			diceDescriptionFontItalic: 'Descrição do Dado em Itálico',
			diceDescriptionFontSize: 'Tamanho da Descrição do Dado',
			diceEnterTimeout: 'Tempo de entrada do dado',
			diceExitTimeout: 'Tempo de saída do dado',
			diceResultFontItalic: 'Resultado do Dado em Itálico',
			diceResultFontSize: 'Tamanho do Resultado do Dado',
			diceScreenTime: 'Tempo de exibição do dado',
			nameFontItalic: 'Nome em Itálico',
			nameFontSize: 'Tamanho do Nome',
			transitions: 'Transições',
			typography: 'Tipografia',
			uploadFont: 'Carregar Fonte',
		},
	},
};
