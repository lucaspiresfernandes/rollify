import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { memo, startTransition, useState } from 'react';
import type { Locale } from '../../../i18n';
import { Searchbar } from '../../sheet/PlayerSkillContainer';

type EditorContainerProps = {
	data: { id: number; name: string }[];
	onDelete: (id: number) => void;
	onEdit: (id: number) => void;
	onCopy: (id: number) => void;
};

const EditorContainer: React.FC<EditorContainerProps> = ({ data, onEdit, onCopy, onDelete }) => {
	const [search, setSearch] = useState('');
	const { t } = useI18n<Locale>();

	return (
		<>
			<Box mx={1} my={1}>
				<Paper sx={{ p: 0.5 }}>
					<Searchbar onSearchChange={(s) => startTransition(() => setSearch(s))} />
				</Paper>
			</Box>
			<Divider />
			<Box height={290} mt={1} sx={{ overflowY: 'auto' }}>
				<Stack spacing={2} py={1} pr={1}>
					{data.map((d) => {
						if (!d.name.toLowerCase().includes(search.toLowerCase())) return null;
						return (
							<Box key={d.id} display='flex' gap={1}>
								<Button
									size='small'
									variant='outlined'
									title={t('delete')}
									onClick={() => onDelete(d.id)}>
									<DeleteIcon />
								</Button>
								<Button
									size='small'
									variant='outlined'
									title={t('update')}
									onClick={() => onEdit(d.id)}>
									<EditIcon />
								</Button>
								<Button
									size='small'
									variant='outlined'
									title={t('copy')}
									onClick={() => onCopy(d.id)}>
									<SaveAsIcon />
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
