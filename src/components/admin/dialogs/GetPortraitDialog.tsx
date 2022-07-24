import CopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import copyToClipboard from 'copy-to-clipboard';
import { useI18n } from 'next-rosetta';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../../i18n';
import { portraitEnvironmentOrientation } from '../../../utils/portrait';

export type GetPortraitDialogProps = {
	playerId: number;
	open: boolean;
	onClose: () => void;
};

type Orientation = typeof portraitEnvironmentOrientation[number];

const GetPortraitDialog: React.FC<GetPortraitDialogProps> = (props) => {
	const [diceColor, setDiceColor] = useState('#ddaf0f');
	const [nameOrientation, setNameOrientation] = useState<Orientation>('Direita');
	const [showDiceRoll, setShowDiceRoll] = useState(true);
	const hostName = useRef('');
	const { t } = useI18n<Locale>();

	const portraitLink =
		`${hostName.current}/portrait/${props.playerId}` +
		`?dicecolor=${diceColor.substring(1)}` +
		`&showdiceroll=${showDiceRoll}` +
		`&orientation=${nameOrientation}`;

	useEffect(() => {
		hostName.current = window.location.host;
	}, []);

	const copyLink = () => {
		const copied = copyToClipboard(portraitLink);
		if (copied) {
			alert('TODO: Link copiado para a sua área de transferência.');
			return props.onClose();
		}
		alert(
			'TODO: O link não pôde ser copiado para sua área de transferência.' +
				' Por favor, copie o link manualmente.'
		);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>TODO: Retrato de Jogador</DialogTitle>
			<DialogContent>
				<DialogContentText>TODO: O Retrato é a integração com o OBS.</DialogContentText>
				<Box display='flex' flexDirection='column' gap={3} mt={4}>
					<div>
						<TextField
							fullWidth
							label='TODO: Cor dos dados'
							value={diceColor}
							onChange={(ev) => setDiceColor(ev.target.value)}
						/>
					</div>
					<div>
						<FormControlLabel
							control={
								<Checkbox
									checked={showDiceRoll}
									onChange={(ev) => setShowDiceRoll(ev.target.checked)}
								/>
							}
							label='TODO: Mostrar rolagem de dados'
						/>
					</div>
					<div>
						<FormControl fullWidth>
							<InputLabel id='portraitSelectLabel'>TODO: Orientação</InputLabel>
							<Select
								labelId='portraitSelectLabel'
								id='portraitSelect'
								label='TODO: Orientação'
								value={nameOrientation}
								onChange={(ev) => setNameOrientation(ev.target.value as Orientation)}>
								{portraitEnvironmentOrientation.map((orientation) => (
									<MenuItem key={orientation} value={orientation}>
										{orientation}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>
					<div>
						<TextField
							fullWidth
							label='TODO: Link do retrato'
							InputProps={{
								endAdornment: (
									<IconButton onClick={copyLink}>
										<CopyIcon />
									</IconButton>
								),
							}}
							value={portraitLink}
							disabled
						/>
					</div>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.close')}</Button>
			</DialogActions>
		</Dialog>
	);
};

export default GetPortraitDialog;
