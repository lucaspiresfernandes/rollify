import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import type { Attribute, PortraitAttribute, RollableAttribute } from '@prisma/client';
import { useI18n } from 'next-rosetta';
import { useEffect, useMemo, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';
import ColorField from '../../../ColorField';

type PortraitValue = { name: string; value: PortraitAttribute | 'NONE' }[];
type RollableValue = { name: string; value: RollableAttribute | 'NO' }[];

const initialState = {
	id: 0,
	name: '',
	color: '#ddaf0f',
	portrait: 'NONE',
	rollable: 'NO',
};

const AttributeEditorDialog: React.FC<EditorDialogProps<Attribute>> = (props) => {
	const [attribute, setAttribute] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data)
				setAttribute({
					...props.data,
					color: `#${props.data.color}`,
					portrait: props.data.portrait || 'NONE',
					rollable: props.data.rollable || 'NO',
				});
			else setAttribute(initialState);
		}
	}, [props.data, props.open]);

	const portraitValues = useMemo<PortraitValue>(
		() => [
			{
				name: t('none'),
				value: 'NONE',
			},
			{
				name: t('primary'),
				value: 'PRIMARY',
			},
			{
				name: t('secondary'),
				value: 'SECONDARY',
			},
		],
		[t]
	);

	const rollableValues = useMemo<RollableValue>(
		() => [
			{ name: t('no'), value: 'NO' },
			{
				name: t('modal.label.currentValue'),
				value: 'VALUE',
			},
			{
				name: t('modal.label.maxValue'),
				value: 'MAX_VALUE',
			},
		],
		[t]
	);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit({
			...attribute,
			color: attribute.color.substring(1),
			portrait: attribute.portrait === 'NONE' ? null : (attribute.portrait as PortraitAttribute),
			rollable: attribute.rollable === 'NO' ? null : (attribute.rollable as RollableAttribute),
		});
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box
					component='form'
					id='attributeEditorDialogForm'
					onSubmit={onSubmit}
					display='flex'
					flexDirection='column'
					gap={2}
					mt={1}>
					<TextField
						required
						autoFocus
						fullWidth
						label={t('sheet.table.name')}
						value={attribute.name}
						onChange={(ev) => setAttribute({ ...attribute, name: ev.target.value })}
					/>
					<Box display='flex' flexDirection='row' gap={2}>
						<ColorField
							fullWidth
							required
							label={t('sheet.table.color')}
							color={attribute.color}
							onColorChange={(color) => setAttribute({ ...attribute, color: color.hex })}
						/>
						<FormControl fullWidth required>
							<InputLabel id='attributePortrait'>{t('sheet.table.portrait')}</InputLabel>
							<Select
								labelId='attributePortrait'
								label={t('sheet.table.portrait')}
								value={attribute.portrait}
								onChange={(ev) => setAttribute({ ...attribute, portrait: ev.target.value })}>
								{portraitValues.map((portrait) => (
									<MenuItem key={portrait.value} value={portrait.value}>
										{portrait.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
					<FormControl fullWidth required>
						<InputLabel id='attributeRollable'>{t('sheet.table.rollable')}</InputLabel>
						<Select
							labelId='attributeRollable'
							label={t('sheet.table.rollable')}
							value={attribute.rollable}
							onChange={(ev) => setAttribute({ ...attribute, rollable: ev.target.value })}>
							{rollableValues.map((rollable) => (
								<MenuItem key={rollable.value} value={rollable.value}>
									{rollable.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='attributeEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AttributeEditorDialog;
