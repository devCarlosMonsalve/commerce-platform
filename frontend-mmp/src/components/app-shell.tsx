'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { getErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/auth.context';
import { useOrganization } from '@/context/organization.context';
import { LanguageSwitcher } from './language-switcher';
import { AiAssistantDrawerContent } from './ai-assistant-drawer-content';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { SvgIconComponent } from '@mui/icons-material';

interface AppShellProps {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}

interface NavigationItem {
  href: '/dashboard' | '/products' | '/customers' | '/orders' | '/suppliers' | '/purchase-orders';
  icon: SvgIconComponent;
  labelKey: 'dashboard' | 'products' | 'customers' | 'orders' | 'suppliers' | 'purchaseOrders';
}

const navigationItems: NavigationItem[] = [
  { href: '/dashboard', icon: DashboardRoundedIcon, labelKey: 'dashboard' },
  { href: '/products', icon: Inventory2OutlinedIcon, labelKey: 'products' },
  { href: '/customers', icon: GroupOutlinedIcon, labelKey: 'customers' },
  { href: '/orders', icon: ReceiptLongOutlinedIcon, labelKey: 'orders' },
  { href: '/suppliers', icon: LocalShippingOutlinedIcon, labelKey: 'suppliers' },
  { href: '/purchase-orders', icon: WarehouseOutlinedIcon, labelKey: 'purchaseOrders' },
];

function isActivePath(currentPath: string, href: NavigationItem['href']): boolean {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function AppShell({ title, description, children, action }: AppShellProps) {
  const nav = useTranslations('nav');
  const common = useTranslations('common');
  const authMessages = useTranslations('auth');
  const organizationsMessages = useTranslations('organizations');
  const assistantMessages = useTranslations('assistant');
  const auth = useAuth();
  const organization = useOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  useEffect(() => {
    if (
      auth.isAuthenticated &&
      !organization.isLoading &&
      !organization.activeOrganization &&
      pathname !== '/dashboard'
    ) {
      router.replace('/dashboard');
    }
  }, [
    auth.isAuthenticated,
    organization.activeOrganization,
    organization.isLoading,
    pathname,
    router,
  ]);

  const sidebarLinks = useMemo(
    () =>
      navigationItems.map(({ href, icon: Icon, labelKey }) => {
        const active = isActivePath(pathname, href);
        const isAvailable = href === '/dashboard' || Boolean(organization.activeOrganization);
        const content = (
          <Box
            aria-disabled={!isAvailable}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1.2,
              mb: 0.75,
              borderRadius: 2.5,
              color: active ? '#173528' : 'rgba(242, 249, 239, 0.68)',
              bgcolor: active ? '#D1F09B' : 'transparent',
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              opacity: isAvailable ? 1 : 0.45,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': isAvailable
                ? { bgcolor: active ? '#D1F09B' : 'rgba(255,255,255,0.08)' }
                : undefined,
            }}
          >
            <Icon fontSize="small" />
            {nav(labelKey)}
          </Box>
        );

        return isAvailable ? (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            {content}
          </Link>
        ) : (
          <Box key={href}>{content}</Box>
        );
      }),
    [nav, organization.activeOrganization, pathname],
  );

  const handleLogout = async () => {
    await auth.logout();
    router.replace('/login');
  };

  const handleCreateOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      await organization.createOrganization({
        name: organizationName.trim(),
        slug: organizationSlug.trim().toLowerCase(),
      });
      setOrganizationName('');
      setOrganizationSlug('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      setCreateError(getErrorMessage(error, organizationsMessages('createError')));
    } finally {
      setIsCreating(false);
    }
  };

  if (auth.isLoading || (auth.isAuthenticated && organization.isLoading)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F5F0E8' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography color="text.secondary">{common('loading')}</Typography>
        </Box>
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#F5F7F4', color: '#173528' }}>
        <Box
          component="aside"
          sx={{
            width: 264,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            p: 2.25,
            bgcolor: '#173528',
            borderRight: '1px solid rgba(16,49,36,0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 0.75, py: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                color: '#173528',
                bgcolor: '#D1F09B',
              }}
            >
              <StorefrontOutlinedIcon fontSize="small" />
            </Box>
            <Typography sx={{ color: '#F2F9EF', fontWeight: 750, letterSpacing: '-0.03em' }}>Commerce</Typography>
          </Box>

          <Typography
            variant="overline"
            sx={{ mt: 5, px: 1, color: 'rgba(242,249,239,0.46)', fontSize: 10, fontWeight: 700, letterSpacing: '0.11em' }}
          >
            {organizationsMessages('switcherLabel')}
          </Typography>

          <Paper elevation={0} sx={{ mt: 1, p: 1.5, borderRadius: 2.5, color: '#F2F9EF', bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography sx={{ fontWeight: 700 }}>
              {organization.activeOrganization?.name ?? organizationsMessages('emptyTitle')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(242,249,239,0.58)' }}>
              {organization.activeOrganization?.slug ?? organizationsMessages('emptyDescription')}
            </Typography>
          </Paper>

          <Typography
            variant="overline"
            sx={{ mt: 3, px: 1, color: 'rgba(242,249,239,0.46)', fontSize: 10, fontWeight: 700, letterSpacing: '0.11em' }}
          >
            {nav('dashboard')}
          </Typography>
          <Box sx={{ mt: 1 }}>{sidebarLinks}</Box>

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.12)' }} />
            <Button
              color="inherit"
              fullWidth
              onClick={() => {
                void handleLogout();
              }}
              sx={{ justifyContent: 'flex-start', px: 1, color: 'rgba(242,249,239,0.72)' }}
            >
              {authMessages('logout')}
            </Button>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2.5, md: 4.5 } }}>
          <Stack spacing={3.5}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                justifyContent: 'space-between',
                alignItems: { lg: 'flex-start' },
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                <Typography variant="body2" sx={{ color: '#668276', fontWeight: 750, letterSpacing: '0.1em', fontSize: '0.68rem' }}>
                  {organizationsMessages('switcherLabel')}
                </Typography>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{ mt: 0.7, fontWeight: 760, letterSpacing: '-0.055em' }}
                >
                  {title}
                </Typography>
                <Typography sx={{ mt: 1, color: '#698074', maxWidth: 700, lineHeight: 1.65 }}>
                  {description}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  flexWrap: { xs: 'wrap', lg: 'nowrap' },
                  alignItems: 'center',
                  flex: '0 0 auto',
                  gap: 1.5,
                  '& .MuiButton-root, & .MuiInputBase-root': {
                    height: 48,
                  },
                }}
              >
                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 260 },
                    '& .MuiInputBase-root': { bgcolor: '#FFFFFF' },
                  }}
                >
                  <Select
                    displayEmpty
                    value={organization.activeOrganizationId ?? ''}
                    onChange={(event) =>
                      organization.setActiveOrganizationId(event.target.value as string)
                    }
                  >
                    {organization.organizations.length === 0 ? (
                      <MenuItem disabled value="">
                        {organizationsMessages('emptyTitle')}
                      </MenuItem>
                    ) : (
                      organization.organizations.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  {organizationsMessages('create')}
                </Button>
                {action}
                <LanguageSwitcher />
                <Button
                  variant="contained"
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  {authMessages('logout')}
                </Button>
              </Box>
            </Box>

            {organization.error ? <Alert severity="error">{organization.error}</Alert> : null}

            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                gap: 1,
                overflowX: 'auto',
                pb: 1,
              }}
            >
              {navigationItems.map(({ href, labelKey }) => {
                const active = isActivePath(pathname, href);
                const isAvailable = href === '/dashboard' || Boolean(organization.activeOrganization);
                const content = (
                  <Box
                    aria-disabled={!isAvailable}
                    sx={{
                      px: 2,
                      py: 1.1,
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                      fontWeight: 600,
                      color: active ? '#173528' : '#456353',
                      bgcolor: active ? '#D1F09B' : '#FFFFFF',
                      border: '1px solid rgba(23,53,40,0.1)',
                      opacity: isAvailable ? 1 : 0.45,
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {nav(labelKey)}
                  </Box>
                );

                return isAvailable ? (
                  <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                    {content}
                  </Link>
                ) : (
                  <Box key={href}>{content}</Box>
                );
              })}
            </Box>

            {children}
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => {
          if (!isCreating) {
            setIsCreateDialogOpen(false);
            setCreateError(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={handleCreateOrganization}>
          <DialogTitle>{organizationsMessages('createTitle')}</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>
              {organizationsMessages('createDescription')}
            </Typography>
            {createError ? <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert> : null}
            <TextField
              autoFocus
              fullWidth
              label={organizationsMessages('name')}
              margin="normal"
              required
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              slotProps={{ htmlInput: { minLength: 2 } }}
            />
            <TextField
              fullWidth
              label={organizationsMessages('slug')}
              margin="normal"
              required
              value={organizationSlug}
              onChange={(event) => setOrganizationSlug(event.target.value.toLowerCase())}
              helperText={organizationsMessages('slugHelper')}
              slotProps={{ htmlInput: { pattern: '[a-z0-9-]+' } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={isCreating} onClick={() => setIsCreateDialogOpen(false)}>
              {common('cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating}
              startIcon={
                isCreating ? <CircularProgress color="inherit" size={16} /> : undefined
              }
            >
              {organizationsMessages('create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Button
        onClick={() => setIsAiDrawerOpen(true)}
        startIcon={<AutoAwesomeRoundedIcon />}
        sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200, color: '#173528', bgcolor: '#D1F09B', boxShadow: '0 10px 24px rgba(23,53,40,0.22)', fontWeight: 750, '&:hover': { bgcolor: '#E1F7B5' } }}
      >
        {assistantMessages('open')}
      </Button>
      <Drawer anchor="right" open={isAiDrawerOpen} onClose={() => setIsAiDrawerOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480 }, p: { xs: 2, sm: 2.5 }, bgcolor: '#F5F7F4' } } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
          <Box>
            <Typography sx={{ color: '#173528', fontWeight: 750, fontSize: '1.2rem' }}>{assistantMessages('title')}</Typography>
            <Typography sx={{ mt: 0.5, color: '#587061', fontSize: '0.9rem', lineHeight: 1.5 }}>{assistantMessages('description')}</Typography>
          </Box>
          <Button aria-label={assistantMessages('close')} onClick={() => setIsAiDrawerOpen(false)} sx={{ minWidth: 40, width: 40, height: 40, p: 0, color: '#285C42' }}>
            <CloseRoundedIcon />
          </Button>
        </Box>
        <AiAssistantDrawerContent
          key={`${pathname}-${organization.activeOrganization?.id ?? 'none'}`}
          pathname={pathname}
          title={title}
          onNavigate={() => setIsAiDrawerOpen(false)}
        />
      </Drawer>
    </>
  );
}
