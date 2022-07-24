import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useI18n } from 'next-rosetta';
import type { Locale } from '../../../i18n';

type PlayerDetailsDialogProps = {
	open: boolean;
	onClose: () => void;
};

const PlayerDetailsDialog: React.FC<PlayerDetailsDialogProps> = (props) => {
	const { t } = useI18n<Locale>();

	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>TODO: Detalhes de Jogador</DialogTitle>
			<DialogContent></DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.close')}</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlayerDetailsDialog;
