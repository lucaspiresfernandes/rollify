import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import SettingsContainer from '.';
import { LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { ConfigResponse } from '../../../pages/api/config';
import { api } from '../../../utils/createApiClient';
import type { PortraitConfig } from '../../../utils/portrait';

type PortraitSettingsProps = {
	portraitConfig: PortraitConfig | null;
};

const PortraitSettings: React.FC<PortraitSettingsProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState(props.portraitConfig);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onApplyChanges = () => {
		setLoading(true);
		api
			.post<ConfigResponse>('/config', {})
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

	return <SettingsContainer loading={loading} onApply={onApplyChanges} gap={3}></SettingsContainer>;
};

export default PortraitSettings;
