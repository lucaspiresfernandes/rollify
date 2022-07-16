import Head from 'next/head';

type ApplicationHeadProps = {
	title?: string;
	children?: React.ReactNode;
};

const ApplicationHead: React.FC<ApplicationHeadProps> = (props) => {
	const titleName = props.title ? `${props.title} - Rollify` : 'Rollify';

	return (
		<Head>
			<meta
				name='description'
				content='Powered by Rollify. Learn more at https://github.com/alyssapiresfernandescefet/openrpg'
			/>
			<meta name='author' content='Alyssa Fernandes' />
			<title>{titleName}</title>
			{props.children}
		</Head>
	);
};

export default ApplicationHead;
