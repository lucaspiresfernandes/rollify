import type { PortraitFontConfig } from '../../utils/portrait';

type PortraitSettingsProps = {
	portraitConfig: PortraitFontConfig | null;
};

const PortraitSettings: React.FC<PortraitSettingsProps> = (props) => {
	return <h1>Portrait Settings</h1>;
};

export default PortraitSettings;
