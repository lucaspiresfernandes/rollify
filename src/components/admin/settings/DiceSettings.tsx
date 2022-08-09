import {
	closestCenter,
	DndContext,
	DragEndEvent,
	Over,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReorderIcon from '@mui/icons-material/Reorder';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useI18n } from 'next-rosetta';
import { startTransition, useContext, useState } from 'react';
import SettingsContainer from '.';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ConfigResponse } from '../../../pages/api/config';
import { getId } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import type { DiceConfig, DiceResultResolver, RelationalOperator } from '../../../utils/dice';

const OPERATIONS: RelationalOperator[] = [
	'equals',
	'notEquals',
	'greaterThan',
	'lessThan',
	'greaterThanOrEquals',
	'lessThanOrEquals',
];

const DICES = [
	{
		name: 'D4',
		value: 4,
	},
	{
		name: 'D6',
		value: 6,
	},
	{
		name: 'D8',
		value: 8,
	},
	{
		name: 'D10',
		value: 10,
	},
	{
		name: 'D12',
		value: 12,
	},
	{
		name: 'D20',
		value: 20,
	},
	{
		name: 'D100',
		value: 100,
	},
] as const;

type ResolverFieldProps = {
	[T in keyof DiceResultResolver[number]]: DiceResultResolver[number][T];
} & {
	id: number;
	onChange: (resolver: DiceResultResolver[number]) => void;
	onDelete: () => void;
};

const ResolverField: React.FC<ResolverFieldProps> = (props) => {
	const sortable = useSortable({
		id: props.id,
	});
	const { t } = useI18n<Locale>();

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(sortable.transform),
		transition: sortable.transition,
	};

	return (
		<>
			<Box
				display='flex'
				flexDirection='row'
				alignItems='center'
				gap={1}
				ref={sortable.setNodeRef}
				style={style}
				p={1}>
				<ReorderIcon
					{...sortable.attributes}
					{...sortable.listeners}
					sx={{
						':hover': {
							cursor: 'grab',
						},
					}}
				/>
				<IconButton onClick={props.onDelete}>
					<DeleteIcon />
				</IconButton>
				TODO: When result is
				<Select
					size='small'
					variant='standard'
					value={props.operator}
					onChange={(ev) =>
						props.onChange({
							description: props.description,
							operator: ev.target.value as RelationalOperator,
							result: props.result,
						})
					}>
					{OPERATIONS.map((op) => (
						<MenuItem key={op} value={op}>
							{t(`operation.${op}`)}
						</MenuItem>
					))}
				</Select>
				<TextField
					variant='standard'
					size='small'
					defaultValue={props.result}
					onChange={(ev) =>
						props.onChange({
							description: props.description,
							operator: props.operator,
							result: ev.target.value,
						})
					}
					sx={{ maxWidth: '7em' }}
					inputProps={{
						style: {
							textAlign: 'center',
						},
					}}
				/>
				TODO: , then description is{' '}
				<TextField
					variant='standard'
					size='small'
					defaultValue={props.description}
					onChange={(ev) =>
						props.onChange({
							result: props.result,
							operator: props.operator,
							description: ev.target.value,
						})
					}
					sx={{ maxWidth: '7em' }}
					inputProps={{
						style: {
							textAlign: 'center',
						},
					}}
				/>
				.
			</Box>
			<Divider />
		</>
	);
};

type DiceSettingsProps = {
	diceConfig: DiceConfig;
};

const DiceSettings: React.FC<DiceSettingsProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		...props.diceConfig,
		resolver: (props.diceConfig.resolver || []).map((res) => ({ id: getId(), ...res })),
		enableResolver: Boolean(props.diceConfig.resolver),
	});
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();
	const sensors = useSensors(useSensor(PointerSensor));

	const addResolver = () => {
		setForm({
			...form,
			resolver: [
				...form.resolver,
				{
					id: getId(),
					description: t('unknown'),
					operator: 'equals',
					result: 0,
				},
			],
		});
	};

	const handleDragEnd = (ev: DragEndEvent) => {
		const over = ev.over as Over | null;
		if (over === null || ev.active.id === over.id) return;

		const oldIndex = form.resolver.findIndex((e) => e.id === ev.active.id);
		const newIndex = form.resolver.findIndex((e) => e.id === over.id);

		setForm((form) => ({ ...form, resolver: arrayMove(form.resolver, oldIndex, newIndex) }));
	};

	const onApplyChanges = () => {
		setLoading(true);
		api
			.post<ConfigResponse>('/config', {
				name: 'dice',
				value: {
					...form,
					resolver: form.enableResolver
						? form.resolver.map((res) => ({ ...res, id: undefined }))
						: null,
					enableResolver: undefined,
				},
			})
			.then((res) => {
				if (res.data.status === 'failure')
					return log({ severity: 'error', text: 'TODO: Could not update setting.' });
				log({ severity: 'success', text: 'TODO: Settings updated.' });
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<SettingsContainer loading={loading} onApply={onApplyChanges} gap={3}>
			<FormControl>
				<InputLabel id='baseDiceLabel'>TODO: Base Dice</InputLabel>
				<Select
					labelId='baseDiceLabel'
					label='TODO: Base Dice'
					defaultValue={form.baseDice}
					onChange={(ev) =>
						startTransition(() => setForm((f) => ({ ...f, baseDice: ev.target.value as number })))
					}>
					{DICES.map((dice) => (
						<MenuItem key={dice.value} value={dice.value}>
							{dice.name}
						</MenuItem>
					))}
				</Select>
				<FormHelperText>
					TODO: The base dice is the dice rolled to all characteristics, skills and attributes.
				</FormHelperText>
			</FormControl>
			<Divider flexItem light />

			<FormControlLabel
				label='TODO: Activate resolvers'
				control={
					<Checkbox
						defaultChecked={Boolean(form.resolver)}
						onChange={(ev) =>
							startTransition(() => setForm((f) => ({ ...f, enableResolver: ev.target.checked })))
						}
					/>
				}
			/>

			{form.enableResolver && (
				<>
					<Button variant='contained' onClick={addResolver} sx={{ mt: -2, alignSelf: 'end' }}>
						TODO: Add New Resolver
					</Button>
					<Typography variant='body2'>
						TODO: You can use the syntax &quot;{'{result}'}&quot; to refer to the result of the dice
						roll.
					</Typography>
					<div>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							modifiers={[restrictToVerticalAxis, restrictToParentElement]}
							onDragEnd={handleDragEnd}>
							<SortableContext items={form.resolver} strategy={verticalListSortingStrategy}>
								<Divider />
								{form.resolver.map((res) => (
									<ResolverField
										key={res.id}
										{...res}
										onChange={(newRes) =>
											startTransition(() =>
												setForm((f) => ({
													...f,
													resolver: f.resolver.map((r) => {
														if (r.id === res.id) return { id: res.id, ...newRes };
														return r;
													}),
												}))
											)
										}
										onDelete={() => {
											if (!confirm(t('prompt.delete'))) return;
											startTransition(() =>
												setForm((f) => ({
													...f,
													resolver: f.resolver.filter((r) => r.id !== res.id),
												}))
											);
										}}
									/>
								))}
							</SortableContext>
						</DndContext>
					</div>
				</>
			)}

			<Divider flexItem light />
			<div>
				<div>
					<FormControlLabel
						label='TODO: Activate characteristic modifiers'
						control={
							<Checkbox
								defaultChecked={form.characteristic.enableModifiers}
								onChange={(ev) =>
									startTransition(() =>
										setForm((f) => ({
											...f,
											characteristic: { enableModifiers: ev.target.checked },
										}))
									)
								}
							/>
						}
					/>
				</div>
				<div>
					<FormControlLabel
						label='TODO: Activate skill modifiers'
						control={
							<Checkbox
								defaultChecked={form.skill.enableModifiers}
								onChange={(ev) =>
									startTransition(() =>
										setForm((f) => ({ ...f, skill: { enableModifiers: ev.target.checked } }))
									)
								}
							/>
						}
					/>
				</div>
			</div>
		</SettingsContainer>
	);
};

export default DiceSettings;
