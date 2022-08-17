import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Currency } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { CurrencySheetApiResponse } from '../../../pages/api/sheet/currency';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import EditorDialog from '../dialogs/editor/EditorDialog';
import EditorContainer from './EditorContainer';

type CurrencyEditorContainerProps = {
	currency: Currency[];
};

const CurrencyEditorContainer: React.FC<CurrencyEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [currency, setCurrency] = useState(props.currency);
	const [dialogData, setDialogData] = useState<EditorDialogData<Currency>>({ operation: 'create' });
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Currency) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/currency', { method: dialogData.operation === 'create' ? 'PUT' : 'POST', data })
			.then((res: AxiosResponse<CurrencySheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newCurrency = res.data.currency;

				if (dialogData.operation === 'create') return setCurrency((i) => [...i, newCurrency]);

				setCurrency((currency) =>
					currency.map((i) => {
						if (i.id === newCurrency.id) return newCurrency;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteCurrency = (id: number) => {
		if (!confirm(t('prompt.delete', {name: 'item'}))) return;
		setLoading(true);
		api
			.delete<CurrencySheetApiResponse>('/sheet/currency', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setCurrency((currency) => currency.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<Section
			title={t('admin.editor.currency')}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.currency')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={currency}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: currency.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onCopy={(id) => {
					setDialogData({ operation: 'create', data: currency.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteCurrency}
			/>
			<EditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.currency'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default CurrencyEditorContainer;
