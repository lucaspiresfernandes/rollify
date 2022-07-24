import {
	closestCenter,
	DndContext,
	DragEndEvent,
	Over,
	PointerSensor,
	useSensor,
	useSensors
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useRef, useState } from 'react';
import { clamp } from '../../../../utils';
import Section from '../../../sheet/Section';

type Entity = {
	id: number;
	name: string;
};

type Storage = {
	round?: number;
	entities?: Entity[];
	pointer?: number;
};

const CombatItem: React.FC<{ entity: Entity; removeEntity: () => void; selected: boolean }> = (
	props
) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: props.entity.id,
	});

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<span>{props.entity.name || 'Desconhecido'}</span>
			<TextField
				variant='standard'
				defaultValue='0'
				sx={{ width: '3rem', mx: 1 }}
				inputProps={{ style: { textAlign: 'center' } }}
			/>
			<Tooltip title='TODO: Excluir' placement='right'>
				<IconButton size='small' onClick={() => props.removeEntity()}>
					<DeleteIcon />
				</IconButton>
			</Tooltip>
		</div>
	);
};

type CombatManagerProps = {
	entities: Entity[];
};

const CombatManager: React.FC<CombatManagerProps> = (props) => {
	const [round, setRound] = useState(1);
	const [activeEntities, setActiveEntities] = useState<Entity[]>([]);
	const [pointer, setPointer] = useState(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 1,
			},
		})
	);

	const componentDidMount = useRef(false);
	const open = Boolean(anchorEl);

	useEffect(() => {
		const storage: Storage = JSON.parse(localStorage.getItem('admin_combat') || '{}');
		if (storage.round) setRound(storage.round);
		if (storage.entities) setActiveEntities(storage.entities);
		if (storage.pointer) setPointer(storage.pointer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (componentDidMount.current) {
			return localStorage.setItem(
				'admin_combat',
				JSON.stringify({
					round,
					entities: activeEntities,
					pointer,
				})
			);
		}
		componentDidMount.current = true;
	}, [round, activeEntities, pointer]);

	useEffect(() => {
		const deletedEntities: number[] = [];
		setActiveEntities((activeEntities) =>
			activeEntities
				.map((activeEntity) => {
					const entity = props.entities.find((e) => e.id === activeEntity.id);
					if (entity) {
						if (entity.name === activeEntity.name) return activeEntity;
						return { id: activeEntity.id, name: entity.name };
					} else {
						deletedEntities.push(activeEntity.id);
						return activeEntity;
					}
				})
				.filter((activeEntity) => !deletedEntities.includes(activeEntity.id))
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.entities]);

	const handleDragEnd = (ev: DragEndEvent) => {
		const over = ev.over as Over | null;
		if (over === null || ev.active.id === over.id) return;

		const oldIndex = activeEntities.findIndex((e) => e.id === ev.active.id);
		const newIndex = activeEntities.findIndex((e) => e.id === over.id);

		console.log(oldIndex, newIndex);

		setActiveEntities((e) => arrayMove(e, oldIndex, newIndex));

		if (oldIndex === pointer) return setPointer(newIndex);
		if (newIndex >= pointer && oldIndex < pointer) return setPointer((p) => p - 1);
		if (oldIndex > pointer && newIndex <= pointer) return setPointer((p) => p + 1);
	};

	const roundUpdate: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const aux = ev.currentTarget.value;
		let newRound = parseInt(aux);
		if (aux.length === 0) newRound = 1;
		else if (isNaN(newRound)) return;
		setRound(clamp(newRound, 1, 100));
	};

	const movePointer = (coeff: number) => {
		if (coeff === 0 || activeEntities.length < 2) return;

		let currentIndex = pointer + coeff;
		if (currentIndex < 0) currentIndex = activeEntities.length - 1;
		else if (currentIndex >= activeEntities.length) currentIndex = 0;

		if (coeff > 0) {
			if (currentIndex === 0 && pointer === activeEntities.length - 1) setRound(round + 1);
		} else if (currentIndex === activeEntities.length - 1 && pointer === 0 && round > 1)
			setRound(round - 1);

		setPointer(currentIndex);
	};

	const reset = () => {
		setActiveEntities([]);
		setPointer(0);
		setRound(1);
	};

	const handleDropdownClick: React.MouseEventHandler<HTMLButtonElement> = (ev) =>
		setAnchorEl(ev.currentTarget);

	const handleDropdownClose = () => setAnchorEl(null);

	const onRemoveEntity = (id: number) => {
		setActiveEntities((entities) =>
			entities.filter((e, index) => {
				const equal = e.id === id;
				if (equal && index < pointer) setPointer(pointer - 1);
				return !equal;
			})
		);
	};

	const inactiveEntities = props.entities.filter(
		(e) => !activeEntities.some((ae) => ae.id === e.id)
	);

	return (
		<Section
			title='Combat'
			sideButton={
				<>
					<IconButton onClick={handleDropdownClick} disabled={inactiveEntities.length === 0}>
						<AddIcon />
					</IconButton>
					<Menu anchorEl={anchorEl} open={open} onClose={handleDropdownClose}>
						{inactiveEntities.map((ent) => {
							if (activeEntities.find((e) => e.id === ent.id)) return null;
							return (
								<MenuItem
									key={ent.id}
									onClick={() => {
										setActiveEntities([...activeEntities, { ...ent }]);
										handleDropdownClose();
									}}>
									{ent.name || 'Desconhecido'}
								</MenuItem>
							);
						})}
					</Menu>
				</>
			}>
			<Box mt={2} px={24}>
				<TextField
					variant='standard'
					type='number'
					fullWidth
					label='TODO: Rodada'
					value={round}
					onChange={roundUpdate}
				/>
			</Box>
			<Box minHeight={100} maxHeight={200} my={2} sx={{ overflowY: 'auto' }}>
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={activeEntities} strategy={verticalListSortingStrategy}>
						<Box display='flex' flexDirection='column' textAlign='center' gap={1}>
							{activeEntities.map((ent, index) => (
								<CombatItem
									key={ent.id}
									entity={ent}
									removeEntity={() => onRemoveEntity(ent.id)}
									selected={pointer === index}
								/>
							))}
						</Box>
					</SortableContext>
				</DndContext>
			</Box>
			<Box display='flex' justifyContent='center' mb={1}>
				<Button variant='contained' onClick={reset}>
					TODO: Reset
				</Button>
			</Box>
		</Section>
	);
};

export default CombatManager;
