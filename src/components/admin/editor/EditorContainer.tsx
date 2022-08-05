import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { FixedSizeList } from 'react-window';

type EditorContainerProps = {
	data: { id: number; name: string }[];
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
};

const EditorContainer: React.FC<EditorContainerProps> = ({ data, onEdit, onDelete }) => {
	const DataRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
		const item = data[index];
		return (
			<EditorRow
				style={style}
				name={item.name}
				onDelete={() => onDelete(item.id)}
				onEdit={() => onEdit(item.id)}
			/>
		);
	};

	return (
		<FixedSizeList height={300} width='100%' itemSize={48} itemCount={data.length}>
			{DataRow}
		</FixedSizeList>
	);
};

type EditorRowProps = {
	name: string;
	onEdit: () => void;
	onDelete: () => void;
	style: React.CSSProperties;
};

const EditorRow: React.FC<EditorRowProps> = (props) => {
	return (
		<Box style={props.style} display='flex' gap={2} py={1}>
			<Button variant='outlined' size='small' onClick={props.onDelete}>
				<DeleteIcon />
			</Button>
			<Button variant='outlined' size='small' onClick={props.onEdit}>
				<EditIcon />
			</Button>
			<TextField variant='standard' fullWidth disabled value={props.name} />
		</Box>
	);
};

export default EditorContainer;
