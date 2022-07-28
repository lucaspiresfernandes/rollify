import ClearIcon from '@mui/icons-material/Clear';
import StarsIcon from '@mui/icons-material/Stars';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { useI18n } from 'next-rosetta';
import { useContext, useState } from 'react';
import { MemoPlayerSkillField, PlayerSkillContainerProps } from '.';
import { AddDataContext, ApiContext, LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { PlayerSkillApiResponse } from '../../../pages/api/sheet/player/skill';
import type { PlayerSkillClearChecksApiResponse } from '../../../pages/api/sheet/player/skill/clearchecks';
import { handleDefaultApiResponse } from '../../../utils';
import PartialBackdrop from '../../PartialBackdrop';
import SheetContainer from '../Section';

type BaseSkillsContainerProps = {
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
	onSkillFavourite: (id: number) => void;
};

const BaseSkillsContainer: React.FC<BaseSkillsContainerProps> = (props) => {
	const [search, setSearch] = useState('');
	const [notify, setNotify] = useState(false);
	const [loading, setLoading] = useState(false);
	const { t } = useI18n<Locale>();
	const log = useContext(LoggerContext);
	const api = useContext(ApiContext);
	const addDataDialog = useContext(AddDataContext);

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

	const onSetFavourite = (id: number) => {
		addDataDialog.closeDialog();
		setLoading(true);
		api
			.post<PlayerSkillApiResponse>('/sheet/player/skill', { id, favourite: true })
			.then((res) => {
				if (res.data.status === 'success') return props.onSkillFavourite(id);
				handleDefaultApiResponse(res, log);
			})
			.catch((err) => log({ severity: 'error', text: err.message }))
			.finally(() => setLoading(false));
	};

	const showFavouriteDialog = () => {
		addDataDialog.openDialog(props.playerSkills, onSetFavourite);
	};

	return (
		<SheetContainer
			title={props.title}
			sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
			sideButton={
				<Tooltip title='TODO: Star Skill' describeChild>
					<IconButton onClick={showFavouriteDialog}>
						<StarsIcon />
					</IconButton>
				</Tooltip>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<Box display='flex' alignItems='center' gap={1} my={1}>
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
			<Box height={330} sx={{ overflowY: 'auto' }}>
				<Grid
					container
					justifyContent='center'
					alignItems='end'
					style={{ overflowWrap: 'break-word' }}>
					{props.playerSkills.map((skill) => {
						return (
							<Grid
								item
								key={skill.id}
								lg={2}
								md={3}
								sm={4}
								xs={6}
								display={
									skill.name.toLowerCase().includes(search.toLowerCase()) ? undefined : 'none'
								}>
								<MemoPlayerSkillField
									{...skill}
									skillDiceConfig={props.skillDiceConfig}
									automaticMarking={props.automaticMarking}
									notifyClearChecked={notify}
								/>
							</Grid>
						);
					})}
				</Grid>
			</Box>
		</SheetContainer>
	);
};

export default BaseSkillsContainer;
