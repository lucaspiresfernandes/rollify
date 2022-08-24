import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { startTransition, useContext, useState } from 'react';
import SettingsContainer from '.';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ConfigResponse } from '../../../pages/api/config';
import { api } from '../../../utils/createApiClient';
import type { GeneralConfig } from '../../../utils/settings';

type GeneralSettingsProps = {
	generalSettings: GeneralConfig;
};

const sections = ['info', 'characteristic', 'skill', 'combat', 'item', 'spell'] as const;

const GeneralSettings: React.FC<GeneralSettingsProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		adminKey: props.generalSettings.adminKey,
		adminKeyVisible: false,
		section: props.generalSettings.section,
	});
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onApplyChanges = () => {
		setLoading(true);
		api
			.post<ConfigResponse>('/config', {
				name: 'general',
				value: {
					...form,
					adminKeyVisible: undefined,
				},
			})
			.then((res) => {
				if (res.data.status === 'failure')
					return log({ severity: 'error', text: t('error.updateFailed') });
			})
			.catch((err) =>
				log({ severity: 'error', text: t('error.unknown', { message: err.message }) })
			)
			.finally(() => setLoading(false));
	};

	return (
		<SettingsContainer loading={loading} onApply={onApplyChanges} gap={3}>
			<TextField
				type={form.adminKeyVisible ? 'text' : 'password'}
				label={t('settings.general.adminKey')}
				helperText={t('settings.general.adminKeyDescription')}
				defaultValue={form.adminKey}
				onChange={(ev) =>
					startTransition(() => setForm((f) => ({ ...f, adminKey: ev.target.value })))
				}
				InputProps={{
					endAdornment: (
						<InputAdornment position='end'>
							<IconButton
								onClick={() => setForm((f) => ({ ...f, adminKeyVisible: !f.adminKeyVisible }))}>
								{form.adminKeyVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
							</IconButton>
						</InputAdornment>
					),
				}}
			/>
			<Divider flexItem />
			<div>
				<Typography variant='h5' textAlign='center'>
					{t('settings.general.section')}
				</Typography>
				<Typography variant='caption'>{t('settings.general.sectionDescription')}</Typography>
			</div>
			<Grid container spacing={4} py={2} justifyContent='center'>
				{sections.map((section) => (
					<Grid item key={section}>
						<TextField
							label={t('settings.general.sectionField', {
								name: props.generalSettings.section[section],
							})}
							defaultValue={form.section[section]}
							onChange={(ev) =>
								startTransition(() =>
									setForm((f) => ({ ...f, section: { ...f.section, [section]: ev.target.value } }))
								)
							}
						/>
					</Grid>
				))}
			</Grid>
		</SettingsContainer>
	);
};

export default GeneralSettings;
