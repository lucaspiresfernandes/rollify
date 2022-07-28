import MenuIcon from '@mui/icons-material/Menu';
import type { PaletteMode } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Toolbar from '@mui/material/Toolbar';
import { useI18n } from 'next-rosetta';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import whiteLogo from '../../public/rollify_white.png';
import useSession from '../hooks/useSession';
import type { Locale } from '../i18n';
import { api } from '../utils/createApiClient';

const languages = new Map<string, string>([
	['en', 'English'],
	['pt-BR', 'Português Brasileiro'],
]);

const Navbar: React.FC<{ mode: PaletteMode; toggleMode: () => void }> = ({ mode, toggleMode }) => {
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const router = useRouter();
	const auth = useSession(router);
	const { t } = useI18n<Locale>();

	if (router.pathname.includes('/portrait')) return null;

	const onLocaleChange = (ev: SelectChangeEvent) => {
		const locale = ev.target.value;
		router.push(router.pathname, undefined, { locale });
	};

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
					{ href: '/admin/panel', name: t('nav.admin.panel') },
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

	return (
		<AppBar position='static'>
			<Toolbar>
				<Box flexGrow={1} width={{ md: 0 }} display={{ xs: 'none', md: 'flex' }} gap={1}>
					{!router.pathname.includes('getting-started') &&
						links.map(({ href, name }) => (
							<Link key={href} href={href} passHref>
								<Button color='inherit'>{name}</Button>
							</Link>
						))}
				</Box>
				<Box flexGrow={1} display={{ xs: 'flex', md: 'none' }} mr={2}>
					<IconButton
						size='large'
						aria-label='account of current user'
						aria-controls='menu-appbar'
						aria-haspopup='true'
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
							<MenuItem key={href} onClick={() => setAnchorElNav(null)}>
								<Link href={href} passHref>
									<MuiLink color='inherit'>{name}</MuiLink>
								</Link>
							</MenuItem>
						))}
					</Menu>
				</Box>
				<div style={{ width: 200 }}>
					<Image src={whiteLogo} alt='LOGO' layout='responsive' priority />
				</div>
				<Box
					display='flex'
					width={{ md: 0, xs: 200 }}
					flexGrow={1}
					gap={2}
					justifyContent='end'
					ml={{ xs: 2, md: 0 }}>
					<Switch
						inputProps={{ 'aria-label': 'Switch Theme' }}
						checked={mode === 'dark'}
						onChange={toggleMode}
					/>
					{auth ? (
						!npcId && (
							<Button
								color='inherit'
								onClick={() => api.delete('/player').then(() => router.push('/'))}>
								{t('nav.exit')}
							</Button>
						)
					) : (
						<Select
							notched
							variant='outlined'
							size='small'
							value={router.locale}
							onChange={onLocaleChange}
							sx={{ color: 'inherit' }}>
							{router.locales?.map((loc) => (
								<MenuItem key={loc} value={loc} color='inherit'>
									{languages.get(loc) || loc}
								</MenuItem>
							))}
						</Select>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
