import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import type { PaletteMode } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useMemo, useState } from 'react';
import whiteLogo from '../../public/rollify_white.png';
import useSession from '../hooks/useSession';
import type { Locale } from '../i18n';
import { api } from '../utils/createApiClient';

const languages = new Map<string, string>([
	['en', 'English'],
	['pt-BR', 'Português (Brasileiro)'],
]);

type NavbarProps = {
	mode: PaletteMode | 'system';
	updateMode: (mode: PaletteMode | 'system') => void;
};

const Navbar: React.FC<NavbarProps> = (props) => {
	return (
		<AppBar position='static'>
			<Toolbar>
				<Grid container justifyContent='space-between' alignItems='center' spacing={3}>
					<Grid item xs={2} md={4} textAlign='start'>
						<Links />
					</Grid>

					<Grid item xs={8} md={4}>
						<div style={{ minWidth: 75, maxWidth: 240, margin: 'auto' }}>
							<Image src={whiteLogo} alt='LOGO' layout='responsive' priority />
						</div>
					</Grid>

					<Grid item xs={2} md={4} textAlign='end'>
						<Settings {...props} />
					</Grid>
				</Grid>
			</Toolbar>
		</AppBar>
	);
};

const Links: React.FC = () => {
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const router = useRouter();
	const auth = useSession(router);
	const { t } = useI18n<Locale>();

	const links = useMemo(() => {
		const npcId = router.query.id as string | undefined;
		let links: { href: string; name: string }[] = [];

		if (auth) {
			if (auth.admin) {
				if (npcId) {
					links = [
						{ href: `/sheet/npc/${npcId}/1`, name: t('nav.player.firstPage') },
						{ href: `/sheet/npc/${npcId}/2`, name: t('nav.player.secondPage') },
					];
				} else {
					links = [
						{ href: '/admin/main', name: t('nav.admin.panel') },
						{ href: '/admin/editor', name: t('nav.admin.editor') },
						{ href: '/admin/settings', name: t('nav.admin.configurations') },
					];
				}
			} else {
				links = [
					{ href: '/sheet/player/1', name: t('nav.player.firstPage') },
					{ href: '/sheet/player/2', name: t('nav.player.secondPage') },
				];
			}
		} else if (auth === null) {
			links = [
				{ href: '/', name: t('login.title') },
				{ href: '/register', name: t('register.title') },
			];
		}

		return links;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth, router]);

	return (
		<>
			<Box display={{ xs: 'none', md: 'block' }} gap={1}>
				{!router.pathname.includes('getting-started') &&
					links.map(({ href, name }) => (
						<Link key={href} href={href} passHref>
							<Button color='inherit'>{name}</Button>
						</Link>
					))}
			</Box>
			<Box display={{ xs: 'block', md: 'none' }}>
				<IconButton
					size='small'
					aria-label='menu'
					onClick={(ev) => setAnchorElNav(ev.currentTarget)}
					color='inherit'>
					<MenuIcon />
				</IconButton>
				<Menu
					id='menu-appbar'
					anchorEl={anchorElNav}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					open={Boolean(anchorElNav)}
					onClose={() => setAnchorElNav(null)}
					sx={{
						display: { xs: 'block', md: 'none' },
					}}>
					{links.map(({ href, name }) => (
						<MenuItem
							key={href}
							onClick={() => {
								setAnchorElNav(null);
								router.push(href);
							}}>
							{name}
						</MenuItem>
					))}
				</Menu>
			</Box>
		</>
	);
};

const Settings: React.FC<NavbarProps> = ({ mode, updateMode }) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const auth = useSession(router);
	const { t } = useI18n<Locale>();

	return (
		<div>
			<Drawer
				keepMounted
				anchor='right'
				open={open}
				variant='temporary'
				onClose={() => setOpen(false)}>
				<Box display='flex' justifyContent='space-between' alignItems='center ' p={2}>
					<Typography variant='h6'>{t('nav.admin.configurations')}</Typography>
					<IconButton size='medium' onClick={() => setOpen(false)}>
						<CloseIcon />
					</IconButton>
				</Box>
				<Divider />
				<Box p={3}>
					<Typography variant='body2' mb={1}>
						{t('nav.admin.mode')}
					</Typography>
					<ButtonGroup size='small'>
						<Button
							startIcon={<LightModeIcon />}
							variant={mode === 'light' ? 'contained' : undefined}
							onClick={() => updateMode('light')}>
							{t('theme.light')}
						</Button>
						<Button
							startIcon={<SettingsBrightnessIcon />}
							variant={mode === 'system' ? 'contained' : undefined}
							onClick={() => updateMode('system')}>
							{t('theme.system')}
						</Button>
						<Button
							startIcon={<DarkModeIcon />}
							variant={mode === 'dark' ? 'contained' : undefined}
							onClick={() => updateMode('dark')}>
							{t('theme.dark')}
						</Button>
					</ButtonGroup>
					<Typography variant='body2' mt={3} mb={1}>
						{t('nav.admin.language')}
					</Typography>
					<List>
						<Divider />
						{router.locales?.map((loc) => (
							<Fragment key={loc}>
								<ListItemButton
									divider
									selected={router.locale === loc}
									onClick={() => {
										if (router.locale === loc) return;
										setOpen(false);
										router
											.push(router.pathname, undefined, { locale: loc })
											.then(() => router.reload());
									}}>
									{languages.get(loc) || loc}
								</ListItemButton>
							</Fragment>
						))}
					</List>
					{auth && (
						<Box mt={2} textAlign='end'>
							<Button
								variant='contained'
								onClick={() => {
									setOpen(false);
									api.delete('/player').then(() => router.push('/'));
								}}>
								{t('nav.exit')}
							</Button>
						</Box>
					)}
				</Box>
			</Drawer>
			<IconButton
				size='small'
				color='inherit'
				onClick={() => setOpen(true)}
				title={t('nav.admin.configurations')}>
				<SettingsIcon />
			</IconButton>
		</div>
	);
};

export default Navbar;
