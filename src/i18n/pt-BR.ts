import type { Locale } from '.';

export const table: Locale = {
	locale: 'pt-BR',
	localeName: 'Português (Brasil)',
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
	star: 'Favoritar',
	unstar: 'Desfavoritar',
	skill: 'Perícia',
	default: 'Padrão',
	details: 'Detalhes',
	player: 'Jogador',
	unknown: 'Desconhecido',
	none: 'Nenhum',
	trade: 'Trocar',
	offering: 'Oferecendo',

	quickAccess: 'Acesso Rápido',

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
		invalidBody:
			'Não foi possível atualizar as informações do personagem. Se esse erro persistir, entre em contato com o desenvolvedor.',
		unauthorized: 'Não foi possível atualizar as informações do personagem. Tente relogar.',
		playerDetailsFetchFailed: 'Falha ao carregar os detalhes do jogador.',
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
		playerCharacteristicTitle: 'Características',
		playerSkillTitle: 'Perícias',
		playerCombatTitle: 'Combate',
		playerItemTitle: 'Itens',
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
		},
	},

	admin: {
		panelTitle: 'Painel do Mestre',
		editorTitle: 'Editor',
		configurationsTitle: 'Configurações',

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
		},
		label: {
			numberOfDices: 'Número de Dados',
			portraitDescription: 'Descrição',
			diceColor: 'Cor dos Dados (em hexadecimal)',
			portraitLink: 'Link do Retrato',
			showDiceRoll: 'Mostrar Rolagem de dados',
			currentValue: 'Valor Atual',
			maxValue: 'Valor Máximo',
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
		removeNpc: 'Tem certeza que deseja remover esse NPC?',
		noAmmo: 'Você não possui munição o suficiente.',
	},
};
