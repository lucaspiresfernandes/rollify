import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { useI18n } from 'next-rosetta';
import { startTransition, useContext, useState } from 'react';
import { PlayerSkillField, PlayerSkillContainerProps, Searchbar } from '.';
import { ApiContext, LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { PlayerSkillApiResponse } from '../../../pages/api/sheet/player/skill';
import type { PlayerSkillClearChecksApiResponse } from '../../../pages/api/sheet/player/skill/clearchecks';
import { handleDefaultApiResponse } from '../../../utils';
import PartialBackdrop from '../../PartialBackdrop';
import SheetContainer from '../Section';

type FavouriteSkillsContainerProps = {
	title: string;
	playerSkills: {
		id: number;
		name: string;
		modifier: number;
		value: number;
		checked: boolean;
	}[];
	skillDiceConfig: PlayerSkillContainerProps['skillDiceConfig'];
	automaticMarking: PlayerSkillContainerProps['automaticMarking'];
	onSkillUnfavourite: (id: number) => void;
};

const FavouriteSkillsContainer: React.FC<FavouriteSkillsContainerProps> = (props) => {
	const [search, setSearch] = useState('');
	const [notify, setNotify] = useState(false);
	const [loading, setLoading] = useState(false);
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const { t } = useI18n<Locale>();

	const clearChecks = () => {
		setLoading(true);
		api
			.post<PlayerSkillClearChecksApiResponse>('/sheet/player/skill/clearchecks')
			.then((res) => {
				if (res.data.status === 'success') return setNotify((n) => !n);
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	const onUnfavourite = (id: number) => {
		setLoading(true);
		api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id, favourite: false })
			.then((res) => {
				if (res.data.status === 'success') return props.onSkillUnfavourite(id);
				handleDefaultApiResponse(res, log, t);
			})
			.catch(() => log({ severity: 'error', text: t('error.unknown') }))
			.finally(() => setLoading(false));
	};

	return (
		<SheetContainer
			title={props.title}
			display='flex'
			flexDirection='column'
			height='100%'
			position='relative'>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<Searchbar
				onSearchChange={(s) => startTransition(() => setSearch(s))}
				onClearChecks={clearChecks}
			/>
			<Divider sx={{ mb: 2 }} />
			<Box
				position='relative'
				flex={{ xs: null, sm: '1 0' }}
				height={{ xs: 300, sm: null }}
				sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
				{props.playerSkills.length === 0 && (
					<Box textAlign='center' color='GrayText'>
						TODO: Starred skills will show up here.
					</Box>
				)}
				<Grid
					container
					justifyContent='center'
					alignItems='stretch'
					position='absolute'
					top={0}
					left={0}
					rowSpacing={4}
					columnSpacing={2}
					sx={{ overflowWrap: 'break-word' }}>
					{props.playerSkills.map((skill) => {
						return (
							<Grid
								item
								key={skill.id}
								md={4}
								xs={6}
								display={skill.name.toLowerCase().includes(search.toLowerCase()) ? 'flex' : 'none'}
								flexDirection='column'
								justifyContent='center'
								textAlign='center'>
								<PlayerSkillField
									{...skill}
									skillDiceConfig={props.skillDiceConfig}
									automaticMarking={props.automaticMarking}
									notifyClearChecked={notify}
									onUnfavourite={() => onUnfavourite(skill.id)}
								/>
							</Grid>
						);
					})}
				</Grid>
			</Box>
		</SheetContainer>
	);
};

export default FavouriteSkillsContainer;
