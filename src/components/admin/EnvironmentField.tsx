import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { LoggerContext } from '../../contexts';
import type { Locale } from '../../i18n';
import type { ConfigResponse } from '../../pages/api/config';
import { api } from '../../utils/createApiClient';
import type { Environment } from '../../utils/portrait';

type EnvironmentFieldProps = {
	environment: Environment;
};

const EnvironmentField: React.FC<EnvironmentFieldProps> = (props) => {
	const [environment, setEnvironment] = useState<Environment>(props.environment);
	const log = useContext(LoggerContext);
	const { t } = useI18n<Locale>();

	const onCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		const value: Environment = event.target.checked ? 'combat' : 'idle';
		api
			.post<ConfigResponse>('/config', { name: 'environment', value })
			.then((res) => {
				if (res.data.status === 'success') return;
				log({ severity: 'error', text: t('error.unknown', { message: res.data.reason }) });
			})
			.catch((err) => t('error.unknown', { message: err.message }));
		setEnvironment(value);
	};

	return (
		<FormControlLabel
			control={<Checkbox checked={environment === 'combat'} onChange={onCheckboxChange} />}
			label='TODO: Combat Environment'
		/>
	);
};

export default EnvironmentField;
