import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { PlayerSkillField, PlayerSkillFieldProps } from '.';
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
		modifier: number | null;
		value: number;
		checked: boolean;
	}[];
	onSkillUnfavourite: NonNullable<PlayerSkillFieldProps['onUnfavourite']>;
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

	const onUnfavourite: FavouriteSkillsContainerProps['onSkillUnfavourite'] = (skill) => {
		setLoading(true);
		api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id: skill.id, favourite: false })
			.then((res) => {
				if (res.data.status === 'success') return props.onSkillUnfavourite(skill);
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
			position='relative'
			sideButton={
				<IconButton title={t('sheet.clearMarkers')} onClick={clearChecks}>
					<RemoveDoneIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<Box
				position='relative'
				flex={{ xs: null, sm: '1 0' }}
				height={{ xs: 360, sm: null }}
				sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
				{props.playerSkills.length === 0 && (
					<Typography variant='body1' textAlign='center' mt={3}>
						{t('placeholder.noFavouriteSkills')}
					</Typography>
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
					pb={2}
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
									notifyClearChecked={notify}
									onUnfavourite={onUnfavourite}
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
