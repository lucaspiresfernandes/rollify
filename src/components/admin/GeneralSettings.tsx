import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { useI18n } from 'next-rosetta';
import { startTransition, useContext, useState } from 'react';
import { LoggerContext } from '../../contexts';
import type { Locale } from '../../i18n';
import type { ConfigResponse } from '../../pages/api/config';
import { api } from '../../utils/createApiClient';
import PartialBackdrop from '../PartialBackdrop';

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

	const onApplyChanges: React.MouseEventHandler<HTMLButtonElement> = (e) => {
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
		<Box
			display='flex'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
			gap={3}
			position='relative'>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<div>
				<TextField
					label='TODO: Admin Key'
					defaultValue={form.adminKey}
					onChange={(ev) =>
						startTransition(() => setForm((f) => ({ ...f, adminKey: ev.target.value })))
					}
				/>
			</div>
			<div>
				<Button variant='contained' onClick={onApplyChanges}>
					Apply
				</Button>
			</div>
		</Box>
	);
};

export default GeneralSettings;
