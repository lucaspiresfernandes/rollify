import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { memo, startTransition, useState } from 'react';
import { Searchbar } from '../../sheet/PlayerSkillContainer';

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
				<Stack spacing={2} py={1} pr={1}>
					{data.map((d) => {
						if (!d.name.toLowerCase().includes(search.toLowerCase())) return null;
						return (
							<Box key={d.id} display='flex' gap={2}>
								<Button variant='outlined' aria-label='delete' onClick={() => onDelete(d.id)}>
									<DeleteIcon />
								</Button>
								<Button variant='outlined' aria-label='update' onClick={() => onEdit(d.id)}>
									<EditIcon />
								</Button>
								<TextField variant='standard' fullWidth disabled value={d.name} />
							</Box>
						);
					})}
				</Stack>
			</Box>
		</>
	);
};

export default memo(EditorContainer);
