import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import type { Attribute, AttributeStatus } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { AttributeSheetApiResponse } from '../../../pages/api/sheet/attribute';
import type { AttributeStatusSheetApiResponse } from '../../../pages/api/sheet/attribute/status';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import AttributeEditorDialog from '../dialogs/editor/AttributeEditorDialog';
import AttributeStatusEditorDialog from '../dialogs/editor/AttributeStatusEditorDialog';
import EditorContainer from './EditorContainer';

type AttributeEditorContainerProps = {
	attribute: Attribute[];
	attributeStatus: AttributeStatus[];
};

const AttributeEditorContainer: React.FC<AttributeEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [attribute, setAttribute] = useState(props.attribute);
	const [dialogData, setDialogData] = useState<EditorDialogData<Attribute>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Attribute) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/attribute', { method: dialogData.operation === 'create' ? 'PUT' : 'POST', data })
			.then((res: AxiosResponse<AttributeSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newAttribute = res.data.attribute;

				if (dialogData.operation === 'create') return setAttribute((i) => [...i, newAttribute]);

				setAttribute((attribute) =>
					attribute.map((i) => {
						if (i.id === newAttribute.id) return newAttribute;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteAttribute = (id: number) => {
		if (!confirm(t('prompt.delete', {name: 'item'}))) return;
		setLoading(true);
		api
			.delete<AttributeSheetApiResponse>('/sheet/attribute', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setAttribute((attribute) => attribute.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<>
			<Grid item xs={12} md={6}>
				<Section
					title={t('admin.editor.attribute')}
					position='relative'
					sideButton={
						<IconButton
							onClick={() => {
								setDialogData({ operation: 'create' });
								setOpenDialog(true);
							}}
							title={`${t('add')} ${t('admin.editor.attribute')}`}>
							<AddIcon />
						</IconButton>
					}>
					<PartialBackdrop open={loading}>
						<CircularProgress color='inherit' disableShrink />
					</PartialBackdrop>
					<EditorContainer
						data={attribute}
						onEdit={(id) => {
							setDialogData({ operation: 'update', data: attribute.find((i) => i.id === id) });
							setOpenDialog(true);
						}}
						onDelete={onDeleteAttribute}
					/>
					<AttributeEditorDialog
						title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
							'admin.editor.attribute'
						)}`}
						open={openDialog}
						onClose={() => setOpenDialog(false)}
						onSubmit={onDialogSubmit}
						data={dialogData.data}
					/>
				</Section>
			</Grid>
			<Grid item xs={12} md={6}>
				<AttributeStatusEditorContainer
					attribute={attribute}
					attributeStatus={props.attributeStatus}
				/>
			</Grid>
		</>
	);
};

const AttributeStatusEditorContainer: React.FC<AttributeEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [attributeStatus, setAttributeStatus] = useState(props.attributeStatus);
	const [dialogData, setDialogData] = useState<EditorDialogData<AttributeStatus>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: AttributeStatus) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/attribute/status', {
			method: dialogData.operation === 'create' ? 'PUT' : 'POST',
			data,
		})
			.then((res: AxiosResponse<AttributeStatusSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newStatus = res.data.attributeStatus;

				if (dialogData.operation === 'create') return setAttributeStatus((i) => [...i, newStatus]);

				setAttributeStatus((attribute) =>
					attribute.map((i) => {
						if (i.id === newStatus.id) return newStatus;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteAttribute = (id: number) => {
		if (!confirm(t('prompt.delete', {name: 'item'}))) return;
		setLoading(true);
		api
			.delete<AttributeStatusSheetApiResponse>('/sheet/attribute/status', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setAttributeStatus((status) => status.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<Section
			title={t('admin.editor.attributeStatus')}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.attributeStatus')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={attributeStatus}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: attributeStatus.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteAttribute}
			/>
			<AttributeStatusEditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.attributeStatus'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				attribute={props.attribute}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default AttributeEditorContainer;
