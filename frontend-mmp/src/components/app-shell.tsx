'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { getErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/auth.context';
import { useOrganization } from '@/context/organization.context';
import { LanguageSwitcher } from './language-switcher';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
  const auth = useAuth();
  const organization = useOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

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
              color: active ? '#F5F0E8' : '#676356',
              bgcolor: active ? '#5C6B40' : 'transparent',
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              opacity: isAvailable ? 1 : 0.45,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': isAvailable
                ? { bgcolor: active ? '#5C6B40' : 'rgba(92,107,64,0.08)' }
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
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#F5F0E8', color: '#2C2C20' }}>
        <Box
          component="aside"
          sx={{
            width: 264,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            p: 2,
            bgcolor: '#F8F4EA',
            borderRight: '1px solid rgba(92,107,64,0.13)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2.5,
                color: '#F5F0E8',
                bgcolor: '#5C6B40',
              }}
            >
              <StorefrontOutlinedIcon fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 750, letterSpacing: '-0.03em' }}>Commerce</Typography>
          </Box>

          <Typography
            variant="overline"
            sx={{ mt: 5, px: 1.25, color: '#8B8577', fontSize: 10, fontWeight: 700 }}
          >
            {organizationsMessages('switcherLabel')}
          </Typography>

          <Paper elevation={0} sx={{ mt: 1, p: 1.5, borderRadius: 3, bgcolor: '#FDFAF4' }}>
            <Typography sx={{ fontWeight: 700 }}>
              {organization.activeOrganization?.name ?? organizationsMessages('emptyTitle')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
              {organization.activeOrganization?.slug ?? organizationsMessages('emptyDescription')}
            </Typography>
          </Paper>

          <Typography
            variant="overline"
            sx={{ mt: 3, px: 1.25, color: '#8B8577', fontSize: 10, fontWeight: 700 }}
          >
            {nav('dashboard')}
          </Typography>
          <Box sx={{ mt: 1 }}>{sidebarLinks}</Box>

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ mb: 1.5, borderColor: 'rgba(92,107,64,0.13)' }} />
            <Button
              color="inherit"
              fullWidth
              onClick={() => {
                void handleLogout();
              }}
              sx={{ justifyContent: 'flex-start', px: 1.25 }}
            >
              {authMessages('logout')}
            </Button>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
          <Stack spacing={3}>
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
                <Typography variant="body2" sx={{ color: '#8B8577', fontWeight: 700 }}>
                  {organizationsMessages('switcherLabel')}
                </Typography>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{ mt: 0.5, fontWeight: 800, letterSpacing: '-0.045em' }}
                >
                  {title}
                </Typography>
                <Typography sx={{ mt: 1, color: '#6B6455', maxWidth: 700 }}>
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
                    '& .MuiInputBase-root': { bgcolor: '#FDFAF4' },
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
                      color: active ? '#F5F0E8' : '#5C6B40',
                      bgcolor: active ? '#5C6B40' : '#FDFAF4',
                      border: '1px solid rgba(92,107,64,0.13)',
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
    </>
  );
}
