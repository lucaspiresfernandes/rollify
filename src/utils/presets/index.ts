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
	attribute_status: AttributeStatus[];
	characteristic: Characteristic[];
	currency: Currency[];
	weapon: Weapon[];
	armor: Armor[];
	extraInfo: ExtraInfo[];
	info: Info[];
	item: Item[];
	skill: Skill[];
	spec: Spec[];
	spell: Spell[];
	config: {
		id: Config['id'];
		name: Config['name'];
		value:
			| string
			| {
					[key: string]: any;
			  };
	}[];
}[];
