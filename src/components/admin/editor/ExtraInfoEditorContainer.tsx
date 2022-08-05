import AddIcon from '@mui/icons-material/AddCircleOutlined';
import IconButton from '@mui/material/IconButton';
import type { ExtraInfo } from '@prisma/client';
import Section from '../../sheet/Section';

type ExtraInfoEditorContainerProps = {
	title: string;
	info: ExtraInfo[];
};

const ExtraInfoEditorContainer: React.FC<ExtraInfoEditorContainerProps> = (props) => {
	return (
		<Section
			title={props.title}
			sideButton={
				<IconButton onClick={() => {}} title='TODO: Add Extra Info'>
					<AddIcon />
				</IconButton>
			}></Section>
	);
};

export default ExtraInfoEditorContainer;
