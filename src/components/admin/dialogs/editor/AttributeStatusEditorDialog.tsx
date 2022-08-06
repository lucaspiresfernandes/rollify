import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Attribute, AttributeStatus } from '@prisma/client';
import MenuItem from '@mui/material/MenuItem';
import { useI18n } from 'next-rosetta';
import { useEffect, useState } from 'react';
import type { EditorDialogProps } from '.';
import type { Locale } from '../../../../i18n';

const initialState: AttributeStatus = {
	id: 0,
	name: '',
	attribute_id: 0,
};

type Props = EditorDialogProps<AttributeStatus> & { attribute: Attribute[] };

const AttributeStatusEditorDialog: React.FC<Props> = (props) => {
	const [attributeStatus, setAttributeStatus] = useState(initialState);
	const { t } = useI18n<Locale>();

	useEffect(() => {
		if (props.open) {
			if (props.data) setAttributeStatus({ ...props.data });
			else setAttributeStatus({ ...initialState, attribute_id: props.attribute[0].id });
		}
	}, [props.data, props.open, props.attribute]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		props.onSubmit(attributeStatus);
	};

	return (
		<Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box
					component='form'
					id='attributeStatusEditorDialogForm'
					onSubmit={onSubmit}
					display='flex'
					flexDirection='column'
					gap={2}
					mt={1}>
					<TextField
						required
						autoFocus
						fullWidth
						label='Name'
						value={attributeStatus.name}
						onChange={(ev) => {
							setAttributeStatus({ ...attributeStatus, name: ev.target.value });
						}}
					/>
					<FormControl required fullWidth>
						<InputLabel id='attributeStatusAttributeLabel'>{t('sheet.table.attribute')}</InputLabel>
						<Select
							labelId='attributeStatusAttributeLabel'
							label={t('sheet.table.attribute')}
							value={attributeStatus.attribute_id}
							onChange={(ev) =>
								setAttributeStatus({
									...attributeStatus,
									attribute_id: ev.target.value as number,
								})
							}>
							{props.attribute.map((attr) => (
								<MenuItem key={attr.id} value={attr.id}>
									{attr.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>{t('modal.cancel')}</Button>
				<Button type='submit' form='attributeStatusEditorDialogForm'>
					{t('modal.apply')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AttributeStatusEditorDialog;
