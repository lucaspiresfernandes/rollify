import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { startTransition, useContext, useState } from 'react';
import SettingsContainer from '.';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ConfigResponse } from '../../../pages/api/config';
import { api } from '../../../utils/createApiClient';

type GeneralSettingsProps = {
	adminKey: string | null;
};

const GeneralSettings: React.FC<GeneralSettingsProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		adminKey: props.adminKey || '123456',
	});
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onApplyChanges = () => {
		setLoading(true);
		api
			.post<ConfigResponse>('/config', {
				name: 'adminKey',
				value: form.adminKey,
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
			<TextField
				label='TODO: Admin Key'
				helperText='TODO: The admin key is used to create a new admin account.'
				defaultValue={form.adminKey}
				onChange={(ev) =>
					startTransition(() => setForm((f) => ({ ...f, adminKey: ev.target.value })))
				}
			/>
		</SettingsContainer>
	);
};

export default GeneralSettings;
