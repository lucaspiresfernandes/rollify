import CopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
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
import type { Environment } from '../../../utils/portrait';
import ColorField from '../../ColorField';

type LockEnvironment = Environment | 'none';

const environments: Environment[] = ['combat', 'idle'];

export type GetPortraitDialogProps = {
	playerId: number;
	open: boolean;
	onClose: () => void;
};

const GetPortraitDialog: React.FC<GetPortraitDialogProps> = (props) => {
	const [diceColor, setDiceColor] = useState('#ddaf0f');
	const [showDiceRoll, setShowDiceRoll] = useState(true);
	const [lockEnvironment, setLockEnvironment] = useState<LockEnvironment>('none');
	const hostName = useRef('');
	const { t } = useI18n<Locale>();

	let portraitLink: URL | string = '';
	if (hostName.current) {
		portraitLink = new URL(`${hostName.current}/portrait/${props.playerId || 0}`);
		if (showDiceRoll) portraitLink.searchParams.append('showdiceroll', String(showDiceRoll));
		portraitLink.searchParams.append('dicecolor', diceColor.substring(1));
		if (lockEnvironment !== 'none')
			portraitLink.searchParams.append('environment', lockEnvironment);
	}

	useEffect(() => {
		hostName.current = window.location.host;
	}, []);

	useEffect(() => {
		if (props.open) {
			setDiceColor('#ddaf0f');
			setShowDiceRoll(true);
		}
	}, [props.open]);

	const copyLink = () => {
		const copied = copyToClipboard(portraitLink.toString());
		if (copied) {
			alert(t('prompt.linkCopied'));
			return props.onClose();
		}
		alert(t('prompt.linkCopyFailed'));
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth='xs'>
			<DialogTitle>{t('modal.title.playerPortrait')}</DialogTitle>
			<DialogContent>
				<Box display='flex' flexDirection='column' mt={1} gap={2}>
					<ColorField
						fullWidth
						label={t('modal.label.diceColor')}
						color={diceColor}
						onColorChange={(ev) => setDiceColor(ev.hex)}
					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={showDiceRoll}
								onChange={(ev) => setShowDiceRoll(ev.target.checked)}
							/>
						}
						label={t('modal.label.showDiceRoll')}
					/>
					<FormControl fullWidth>
						<InputLabel id='portraitEnvironmentLabel'>
							{t('modal.label.environmentLabel')}
						</InputLabel>
						<Select
							fullWidth
							labelId='portraitEnvironmentLabel'
							value={lockEnvironment}
							onChange={(ev) => setLockEnvironment(ev.target.value as Environment | 'none')}
							label={t('modal.label.environmentLabel')}>
							<MenuItem value='none'>{t('none')}</MenuItem>
							{environments.map((env) => (
								<MenuItem key={env} value={env}>
									{t(`modal.label.environment.${env}`)}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
				<Divider sx={{ my: 2 }} />
				<TextField
					fullWidth
					label={t('modal.label.portraitLink')}
					InputProps={{
						endAdornment: (
							<IconButton onClick={copyLink}>
								<CopyIcon />
							</IconButton>
						),
					}}
					value={portraitLink.toString()}
					disabled
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.close')}</Button>
			</DialogActions>
		</Dialog>
	);
};

export default GetPortraitDialog;
