import AddIcon from '@mui/icons-material/AddCircleOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { Weapon } from '@prisma/client';
import type { AxiosResponse } from 'axios';
import { useI18n } from 'next-rosetta';
import { useContext, useMemo, useState } from 'react';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { WeaponSheetApiResponse } from '../../../pages/api/sheet/weapon';
import { handleDefaultApiResponse } from '../../../utils';
import { api } from '../../../utils/createApiClient';
import PartialBackdrop from '../../PartialBackdrop';
import Section from '../../sheet/Section';
import type { EditorDialogData } from '../dialogs/editor';
import WeaponEditorDialog from '../dialogs/editor/WeaponEditorDialog';
import EditorContainer from './EditorContainer';

type WeaponEditorContainerProps = {
	weapon: Weapon[];
};

const WeaponEditorContainer: React.FC<WeaponEditorContainerProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [weapon, setWeapon] = useState(props.weapon);
	const [dialogData, setDialogData] = useState<EditorDialogData<Weapon>>({
		operation: 'create',
	});
	const [openDialog, setOpenDialog] = useState(false);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onDialogSubmit = (data: Weapon) => {
		setOpenDialog(false);
		setLoading(true);

		api('/sheet/weapon', {
			method: dialogData.operation === 'create' ? 'PUT' : 'POST',
			data,
		})
			.then((res: AxiosResponse<WeaponSheetApiResponse>) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				const newWeapon = res.data.weapon[0];

				if (dialogData.operation === 'create') return setWeapon((i) => [...i, newWeapon]);

				setWeapon((weapon) =>
					weapon.map((i) => {
						if (i.id === newWeapon.id) return newWeapon;
						return i;
					})
				);
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const onDeleteWeapon = (id: number) => {
		if (!confirm(t('prompt.delete', {name: 'item'}))) return;
		setLoading(true);
		api
			.delete<WeaponSheetApiResponse>('/sheet/weapon', { data: { id } })
			.then((res) => {
				if (res.data.status === 'failure') return handleDefaultApiResponse(res, log, t);
				setWeapon((weapon) => weapon.filter((i) => i.id !== id));
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	const weaponList = useMemo(() => weapon.sort((a, b) => a.name.localeCompare(b.name)), [weapon]);

	return (
		<Section
			title={t('admin.editor.weapon')}
			position='relative'
			sideButton={
				<IconButton
					onClick={() => {
						setDialogData({ operation: 'create' });
						setOpenDialog(true);
					}}
					title={`${t('add')} ${t('admin.editor.weapon')}`}>
					<AddIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<EditorContainer
				data={weaponList}
				onEdit={(id) => {
					setDialogData({ operation: 'update', data: weapon.find((i) => i.id === id) });
					setOpenDialog(true);
				}}
				onDelete={onDeleteWeapon}
			/>
			<WeaponEditorDialog
				title={`${dialogData.operation === 'create' ? t('add') : t('update')} ${t(
					'admin.editor.weapon'
				)}`}
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onSubmit={onDialogSubmit}
				data={dialogData.data}
			/>
		</Section>
	);
};

export default WeaponEditorContainer;
