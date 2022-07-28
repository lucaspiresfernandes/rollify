import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { MemoPlayerSkillField, PlayerSkillContainerProps } from '.';
import { ApiContext, LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
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
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	return (
		<SheetContainer
			title={`${props.title} (${t('quickAccess')})`}
			sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
			<Box display='flex' alignItems='center' gap={1} my={1}>
				<PartialBackdrop open={loading}>
					<CircularProgress color='inherit' disableShrink />
				</PartialBackdrop>
				<Paper sx={{ p: 0.5, flex: '1 0' }}>
					<InputBase
						fullWidth
						placeholder={t('search')}
						inputProps={{ 'aria-label': t('search') }}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						endAdornment={
							search ? (
								<IconButton size='small' onClick={() => setSearch('')}>
									<ClearIcon />
								</IconButton>
							) : undefined
						}
					/>
				</Paper>
				<div>
					<Button size='small' variant='outlined' onClick={clearChecks}>
						{t('sheet.clearMarkers')}
					</Button>
				</div>
			</Box>
			<Divider sx={{ mb: 2 }} />
			<Box
				position='relative'
				flex={{ sm: '1 0' }}
				height={{ xs: 330, sm: null }}
				sx={{ overflowY: 'auto' }}>
				<Grid
					container
					justifyContent='center'
					alignItems='end'
					position='absolute'
					top={0}
					left={0}
					sx={{ overflowWrap: 'break-word' }}>
					{props.playerSkills.map((skill) => {
						return (
							<Grid
								item
								key={skill.id}
								md={4}
								xs={6}
								display={
									skill.name.toLowerCase().includes(search.toLowerCase()) ? undefined : 'none'
								}>
								<MemoPlayerSkillField
									{...skill}
									skillDiceConfig={props.skillDiceConfig}
									automaticMarking={props.automaticMarking}
									notifyClearChecked={notify}
									onDelete={() => props.onSkillUnfavourite(skill.id)}
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
