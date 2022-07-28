import type {
	Armor,
	Attribute,
	AttributeStatus,
	Characteristic,
	Currency, ExtraInfo,
	Info,
	Item,
	Skill,
	Spec,
	Specialization,
	Spell,
	Weapon
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
	specialization: Specialization[];
	spell: Spell[];
}[];
