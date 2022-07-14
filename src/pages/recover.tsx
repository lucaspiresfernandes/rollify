import type { NextPage } from 'next';
import { useI18n } from 'next-rosetta';
import Head from 'next/head';
import type { Locale } from '../i18n';

const RecoverPage: NextPage = () => {
	const { t } = useI18n<Locale>();

	return (
		<>
			<Head>
				<title>{t('login.title')}</title>
			</Head>
			<Recover />
		</>
	);
};

const Recover: React.FC = () => {
	return <h1>Recover</h1>;
};

export default RecoverPage;
