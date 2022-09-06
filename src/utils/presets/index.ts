import type {
	Armor,
	Attribute,
	AttributeStatus,
	Characteristic,
	Config,
	Currency,
	ExtraInfo,
	Info,
	Item,
	Skill,
	Spec,
	Spell,
	Weapon,
} from '@prisma/client';

export type Presets = {
	preset_name: string;
	preset_id: string;
	attribute: Attribute[];
	attribute_status: Omit<AttributeStatus, 'id'>[];
	characteristic: Omit<Characteristic, 'id'>[];
	currency: Omit<Currency, 'id'>[];
	weapon: Omit<Weapon, 'id'>[];
	armor: Omit<Armor, 'id'>[];
	extraInfo: Omit<ExtraInfo, 'id'>[];
	info: Omit<Info, 'id'>[];
	item: Omit<Item, 'id'>[];
	skill: Omit<Skill, 'id'>[];
	spec: Omit<Spec, 'id'>[];
	spell: Omit<Spell, 'id'>[];
	config: {
		name: Config['name'];
		value:
			| string
			| {
					[key: string]: any;
			  };
	}[];
}[];
