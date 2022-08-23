import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import { startTransition, useCallback, useContext, useMemo, useState } from 'react';
import { PlayerSkillField, PlayerSkillFieldProps } from '.';
import { ApiContext, LoggerContext } from '../../../contexts';
import type { Locale } from '../../../i18n';
import type { PlayerSkillApiResponse } from '../../../pages/api/sheet/player/skill';
import type { PlayerSkillClearChecksApiResponse } from '../../../pages/api/sheet/player/skill/clearchecks';
import { handleDefaultApiResponse } from '../../../utils';
import PartialBackdrop from '../../PartialBackdrop';
import SheetContainer from '../Section';

const SKILLS_PER_PAGE = 12;

type BaseSkillsContainerProps = {
	title: string;
	playerSkills: {
		id: number;
		name: string;
		modifier: number | null;
		value: number;
		checked: boolean;
	}[];
	onSkillFavourite: NonNullable<PlayerSkillFieldProps['onFavourite']>;
};

const BaseSkillsContainer: React.FC<BaseSkillsContainerProps> = (props) => {
	const [search, setSearch] = useState('');
	const [notify, setNotify] = useState(false);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
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

	const onSetFavourite = useCallback<BaseSkillsContainerProps['onSkillFavourite']>(
		(skill) => {
			setLoading(true);
			api
				.post<PlayerSkillApiResponse>('/sheet/player/skill', { id: skill.id, favourite: true })
				.then((res) => {
					if (res.data.status === 'success') return props.onSkillFavourite(skill);
					handleDefaultApiResponse(res, log, t);
				})
				.catch(() => log({ severity: 'error', text: t('error.unknown') }))
				.finally(() => setLoading(false));
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[api, t, props.onSkillFavourite, log]
	);

	const previousPageSkillName = useMemo(
		() => props.playerSkills[(page - 2) * SKILLS_PER_PAGE]?.name || '-',
		[page, props.playerSkills]
	);
	const nextPageSkillName = useMemo(
		() => props.playerSkills[page * SKILLS_PER_PAGE]?.name || '-',
		[page, props.playerSkills]
	);

	return (
		<SheetContainer
			title={props.title}
			sideButton={
				<IconButton title={t('sheet.clearMarkers')} onClick={clearChecks}>
					<RemoveDoneIcon />
				</IconButton>
			}>
			<PartialBackdrop open={loading}>
				<CircularProgress color='inherit' disableShrink />
			</PartialBackdrop>
			<div>
				<Paper sx={{ my: 1, py: 0.5, px: 1, flex: '1 0' }}>
					<InputBase
						fullWidth
						placeholder={t('search')}
						inputProps={{ 'aria-label': t('search') }}
						onChange={(e) =>
							startTransition(() => {
								setSearch(e.target.value);
								setPage(1);
							})
						}
					/>
				</Paper>
				<Grid container py={2} rowGap={2} alignItems='center' justifyContent='center'>
					{!search && (
						<Grid item xs={12} sm={2}>
							<Typography variant='body1' component='div' color='GrayText' textAlign='center'>
								{previousPageSkillName}
							</Typography>
						</Grid>
					)}
					<Grid item xs={12} sm={8} display='flex' justifyContent='center'>
						<Pagination
							color='primary'
							count={search ? 1 : Math.ceil(props.playerSkills.length / SKILLS_PER_PAGE)}
							page={page}
							onChange={(_, page) => setPage(page)}
						/>
					</Grid>
					{!search && (
						<Grid item xs={12} sm={2}>
							<Typography variant='body1' component='div' color='GrayText' textAlign='center'>
								{nextPageSkillName}
							</Typography>
						</Grid>
					)}
				</Grid>
			</div>
			<Divider />
			<Grid
				container
				justifyContent='center'
				alignItems='stretch'
				rowSpacing={4}
				columnSpacing={2}
				py={2}>
				{props.playerSkills.map((skill, index) => {
					const display = search
						? skill.name.toLowerCase().includes(search.toLowerCase())
						: Math.floor(index / SKILLS_PER_PAGE) + 1 === page;

					return (
						<Grid
							item
							key={skill.id}
							lg={2}
							md={3}
							sm={4}
							xs={6}
							display={display ? 'flex' : 'none'}
							flexDirection='column'
							justifyContent='center'
							textAlign='center'>
							<PlayerSkillField
								{...skill}
								notifyClearChecked={notify}
								onFavourite={onSetFavourite}
							/>
						</Grid>
					);
				})}
			</Grid>
		</SheetContainer>
	);
};

export default BaseSkillsContainer;
