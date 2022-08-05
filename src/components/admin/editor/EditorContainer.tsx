import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box, { BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Searchbar } from '../../sheet/PlayerSkillContainer';
import { memo, startTransition, useState } from 'react';

type EditorContainerProps = {
	data: { id: number; name: string }[];
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
};

const EditorContainer: React.FC<EditorContainerProps> = ({ data, onEdit, onDelete }) => {
	const [search, setSearch] = useState('');

	return (
		<>
			<Box mx={1} my={1}>
				<Paper sx={{ p: 0.5, flex: '1 0' }}>
					<Searchbar onSearchChange={(s) => startTransition(() => setSearch(s))} />
				</Paper>
			</Box>
			<Divider />
			<Box height={260} mt={1} sx={{ overflowY: 'auto' }}>
				<Stack spacing={2} py={1}>
					{data.map((d) => {
						if (!d.name.toLowerCase().includes(search.toLowerCase())) return null;
						return (
							<EditorField
								key={d.id}
								display='flex'
								gap={2}
								name={d.name}
								onEdit={() => onEdit(d.id)}
								onDelete={() => onDelete(d.id)}
							/>
						);
					})}
				</Stack>
			</Box>
		</>
	);
};

type EditorFieldProps = BoxProps & {
	name: string;
	onEdit: () => void;
	onDelete: () => void;
};

const EditorField: React.FC<EditorFieldProps> = ({ name, onEdit, onDelete, ...props }) => {
	return (
		<Box {...props}>
			<Button variant='outlined' aria-label='delete' onClick={onDelete}>
				<DeleteIcon />
			</Button>
			<Button variant='outlined' aria-label='update' onClick={onEdit}>
				<EditIcon />
			</Button>
			<TextField variant='standard' fullWidth disabled value={name} />
		</Box>
	);
};

export default memo(EditorContainer);
