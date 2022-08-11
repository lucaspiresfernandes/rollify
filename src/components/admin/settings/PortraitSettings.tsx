import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { useI18n } from 'next-rosetta';
import { startTransition, useContext, useState } from 'react';
import SettingsContainer from '.';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ConfigResponse } from '../../../pages/api/config';
import { api } from '../../../utils/createApiClient';
import { DEFAULT_PORTRAIT_CONFIG, PortraitConfig } from '../../../utils/portrait';

type PortraitSettingsProps = {
	portraitConfig: PortraitConfig | null;
};

const PortraitSettings: React.FC<PortraitSettingsProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState(props.portraitConfig || DEFAULT_PORTRAIT_CONFIG);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onFontChanged: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		if (!e.target.files) return;

		const file = e.target.files.item(0);

		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			if (!e.target) return;

			const base64 = e.target.result;
			startTransition(() =>
				setForm((f) => ({
					...f,
					customFont: {
						name: file.name,
						data: String(base64),
					},
				}))
			);
		};
		reader.readAsDataURL(file);
	};

	const onApplyChanges = () => {
		setLoading(true);
		api
			.post<ConfigResponse>('/config', {
				name: 'portrait',
				value: form,
			})
			.then((res) => {
				if (res.data.status === 'failure')
					return log({ severity: 'error', text: 'TODO: Could not update setting.' });
				log({ severity: 'success', text: 'TODO: Settings updated.' });
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<SettingsContainer loading={loading} onApply={onApplyChanges} gap={3}>
			<Typography variant='h5'>TODO: Custom Font</Typography>
			<Box textAlign='center'>
				<Typography variant='body2' mb={1}>
					TODO: Current Font: {form.customFont?.name || t('none')}
				</Typography>
				<Button variant='contained' component='label'>
					Upload File
					<input
						type='file'
						id='portraitCustomFont'
						onChange={onFontChanged}
						accept='.ttf,.woff'
						hidden
					/>
				</Button>
				<Button
					variant='contained'
					sx={{ ml: 3 }}
					onClick={() => startTransition(() => setForm((f) => ({ ...f, customFont: null })))}>
					{t('clear')}
				</Button>
			</Box>
			<Divider flexItem light />
			<Typography variant='h5'>TODO: Typography</Typography>
			<div>
				<TextField
					label='TODO: Dice Result Font Size'
					InputProps={{ endAdornment: <InputAdornment position='end'>px</InputAdornment> }}
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,3}' }}
					sx={{ mr: 3 }}
					value={form.typography.dice.result.fontSize}
					onChange={(ev) => {
						if (ev.target.validity.valid)
							setForm((f) => ({
								...f,
								typography: {
									...f.typography,
									dice: {
										...f.typography.dice,
										result: {
											...f.typography.dice.result,
											fontSize: Number(ev.target.value),
										},
									},
								},
							}));
					}}
				/>
				<FormControlLabel
					label='TODO: Dice Result Font Italic'
					control={
						<Checkbox
							defaultChecked={form.typography.dice.result.italic}
							onChange={(ev) =>
								startTransition(() =>
									setForm((f) => ({
										...f,
										typography: {
											...f.typography,
											dice: {
												...f.typography.dice,
												result: {
													...f.typography.dice.result,
													italic: ev.target.checked,
												},
											},
										},
									}))
								)
							}
						/>
					}
				/>
			</div>
			<div>
				<TextField
					label='TODO: Dice Description Font Size'
					InputProps={{ endAdornment: <InputAdornment position='end'>px</InputAdornment> }}
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,3}' }}
					sx={{ mr: 3 }}
					value={form.typography.dice.description.fontSize}
					onChange={(ev) => {
						if (ev.target.validity.valid)
							setForm((f) => ({
								...f,
								typography: {
									...f.typography,
									dice: {
										...f.typography.dice,
										description: {
											...f.typography.dice.description,
											fontSize: Number(ev.target.value),
										},
									},
								},
							}));
					}}
				/>
				<FormControlLabel
					label='TODO: Dice Description Font Italic'
					control={
						<Checkbox
							defaultChecked={form.typography.dice.description.italic}
							onChange={(ev) =>
								startTransition(() =>
									setForm((f) => ({
										...f,
										typography: {
											...f.typography,
											dice: {
												...f.typography.dice,
												description: {
													...f.typography.dice.description,
													italic: ev.target.checked,
												},
											},
										},
									}))
								)
							}
						/>
					}
				/>
			</div>
			<div>
				<TextField
					label='TODO: Attribute Font Size'
					InputProps={{ endAdornment: <InputAdornment position='end'>px</InputAdornment> }}
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,3}' }}
					sx={{ mr: 3 }}
					value={form.typography.attribute.fontSize}
					onChange={(ev) => {
						if (ev.target.validity.valid)
							setForm((f) => ({
								...f,
								typography: {
									...f.typography,
									attribute: {
										...f.typography.attribute,
										fontSize: Number(ev.target.value),
									},
								},
							}));
					}}
				/>
				<FormControlLabel
					label='TODO: Attribute Font Italic'
					control={
						<Checkbox
							defaultChecked={form.typography.attribute.italic}
							onChange={(ev) =>
								startTransition(() =>
									setForm((f) => ({
										...f,
										typography: {
											...f.typography,
											attribute: {
												...f.typography.attribute,
												italic: ev.target.checked,
											},
										},
									}))
								)
							}
						/>
					}
				/>
			</div>
			<div>
				<TextField
					label='TODO: Name Font Size'
					InputProps={{ endAdornment: <InputAdornment position='end'>px</InputAdornment> }}
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,3}' }}
					sx={{ mr: 3 }}
					value={form.typography.name.fontSize}
					onChange={(ev) => {
						if (ev.target.validity.valid)
							setForm((f) => ({
								...f,
								typography: {
									...f.typography,
									name: {
										...f.typography.name,
										fontSize: Number(ev.target.value),
									},
								},
							}));
					}}
				/>
				<FormControlLabel
					label='TODO: Name Font Italic'
					control={
						<Checkbox
							defaultChecked={form.typography.name.italic}
							onChange={(ev) =>
								startTransition(() =>
									setForm((f) => ({
										...f,
										typography: {
											...f.typography,
											name: {
												...f.typography.name,
												italic: ev.target.checked,
											},
										},
									}))
								)
							}
						/>
					}
				/>
			</div>
			<Divider flexItem light />
			<Typography variant='h5'>TODO: Transitions</Typography>
			<Box display='flex' flexDirection='row' gap={3}>
				<TextField
					label='TODO: Dice Enter Timeout'
					InputProps={{ endAdornment: <InputAdornment position='end'>ms</InputAdornment> }}
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,4}' }}
					value={form.transitions.dice.enterTimeout}
					onChange={(ev) => {
						if (ev.target.validity.valid)
							setForm((f) => ({
								...f,
								transitions: {
									...f.transitions,
									dice: {
										...f.transitions.dice,
										enterTimeout: Number(ev.target.value),
									},
								},
							}));
					}}
				/>
				<TextField
					label='TODO: Dice Screen Time'
					InputProps={{ endAdornment: <InputAdornment position='end'>ms</InputAdornment> }}
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,4}' }}
					value={form.transitions.dice.screenTimeout}
					onChange={(ev) => {
						if (ev.target.validity.valid)
							setForm((f) => ({
								...f,
								transitions: {
									...f.transitions,
									dice: {
										...f.transitions.dice,
										screenTimeout: Number(ev.target.value),
									},
								},
							}));
					}}
				/>
				<TextField
					label='TODO: Dice Exit Timeout'
					InputProps={{ endAdornment: <InputAdornment position='end'>ms</InputAdornment> }}
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]{0,4}' }}
					value={form.transitions.dice.exitTimeout}
					onChange={(ev) => {
						if (ev.target.validity.valid)
							setForm((f) => ({
								...f,
								transitions: {
									...f.transitions,
									dice: {
										...f.transitions.dice,
										exitTimeout: Number(ev.target.value),
									},
								},
							}));
					}}
				/>
			</Box>
		</SettingsContainer>
	);
};

export default PortraitSettings;
