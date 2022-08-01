import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useContext, useEffect, useState } from 'react';
import { ApiContext, LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import { handleDefaultApiResponse } from '../../../utils';
import type { TradeType } from '../../../utils/socket';
import PartialBackdrop from '../../PartialBackdrop';

export type PlayerTradeDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (partnerId: number, partnerItemId?: number) => void;

	type: TradeType;
	partners: { id: number; name: string }[];

	offerId: number;
	currentItems: { id: number; name: string }[];
};

const PlayerTradeDialog: React.FC<PlayerTradeDialogProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [partnerId, setPartnerId] = useState<number | ''>(props.partners[0]?.id || '');
	const [partnerItems, setPartnerItems] = useState<{ id: number; name: string }[]>([]);
	const [partnerItemId, setPartnerItemId] = useState(0);
	const { t } = useI18n<Locale>();
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);

	useEffect(() => {
		if (props.open) {
			setPartnerId(props.partners[0]?.id || '');
		}
	}, [props.open, props.partners]);

	useEffect(() => {
		if (partnerId !== '') {
			setLoading(true);
			api
				.get(`/sheet/player/${props.type}`, { params: { playerId: partnerId } })
				.then((res) => {
					if (res.data.status === 'failure') {
						props.onClose();
						return handleDefaultApiResponse(res, log, t);
					}
					const items = res.data[props.type];
					setPartnerItems(items);
					setPartnerItemId(0);
				})
				.catch((err) => {
					props.onClose();
					log({ severity: 'error', text: t('error.unknown', { message: err.message }) });
				})
				.finally(() => setLoading(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [partnerId, props.type]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();
		if (partnerId !== '') props.onSubmit(partnerId, partnerItemId || undefined);
	};

	const availableItems = partnerItems.filter(
		(item) => !props.currentItems.some((i) => i.id === item.id)
	);

	const offer = props.currentItems.find((i) => i.id === props.offerId);

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			TransitionProps={{ onExited: () => setPartnerId('') }}
			PaperProps={{ sx: { position: 'relative' } }}
			fullWidth>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<DialogTitle>TODO: Trade</DialogTitle>
			<DialogContent>
				<Box
					component='form'
					id='playerTradeDialogForm'
					onSubmit={onSubmit}
					display='flex'
					flexDirection='column'
					gap={2}>
					<Typography variant='h5' textAlign='center'>
						{t('offering')}: {offer?.name || 'Unknown'}
					</Typography>

					<FormControl fullWidth>
						<InputLabel id='portraitSelectLabel'>To</InputLabel>
						<Select
							fullWidth
							value={partnerId}
							onChange={(ev) => setPartnerId(ev.target.value as number)}
							label='To'
							disabled={props.partners.length === 0}>
							{props.partners.map((partner) => (
								<MenuItem key={partner.id} value={partner.id}>
									{partner.name || t('unknown')}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl fullWidth>
						<InputLabel id='portraitSelectLabel'>Trade for</InputLabel>
						<Select
							fullWidth
							value={partnerItemId}
							onChange={(ev) => setPartnerItemId(ev.target.value as number)}
							label='Trade for'>
							<MenuItem value={0}>{t('none')}</MenuItem>
							{availableItems.map((item) => (
								<MenuItem key={item.id} value={item.id}>
									{item.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='playerTradeDialogForm' disabled={props.partners.length === 0}>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlayerTradeDialog;
