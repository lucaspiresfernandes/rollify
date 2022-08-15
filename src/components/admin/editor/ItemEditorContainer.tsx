import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Item } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useMemo, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ItemSheetApiResponse } from '../../../pages/api/sheet/item';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import ItemEditorDialog from '../dialogs/editor/ItemEditorDialog';
import EditorContainer from './EditorContainer';

type ItemEditorContainerProps = {
	item: Item[];
};

const ItemEditorContainer: React.FC<ItemEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [item, setItem] = useState(props.item);
	const [dialogData, setDialogData] = useState<EditorDialogData<Item>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Item) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/item', {
			method: dialogData.operation === 'create' ? 'PUT' : 'POST',
			data,
		})
			.then((res: AxiosResponse<ItemSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newItem = res.data.item[0];

				if (dialogData.operation === 'create') return setItem((i) => [...i, newItem]);

				setItem((item) =>
					item.map((i) => {
						if (i.id === newItem.id) return newItem;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteItem = (id: number) => {
		if (!confirm(t('prompt.delete', {name: 'item'}))) return;
		setLoading(true);
		api
			.delete<ItemSheetApiResponse>('/sheet/item', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setItem((item) => item.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const itemList = useMemo(() => item.sort((a, b) => a.name.localeCompare(b.name)), [item]);

	return (
		<Section
			title={t('admin.editor.item')}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.item')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={itemList}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: item.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteItem}
			/>
			<ItemEditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.item'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default ItemEditorContainer;
