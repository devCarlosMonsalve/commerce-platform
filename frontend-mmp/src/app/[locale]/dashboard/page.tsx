'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AppShell } from '@/components/app-shell';
import { useOrganization } from '@/context/organization.context';
import { getErrorMessage } from '@/lib/api-error';
import { formatAmount, formatDateTime } from '@/lib/format';
import { customersService } from '@/services/customers.service';
import { ordersService } from '@/services/orders.service';
import { productsService } from '@/services/products.service';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { suppliersService } from '@/services/suppliers.service';
import type {
  CustomerResponse,
  OrderResponse,
  ProductResponse,
  PurchaseOrderResponse,
  SupplierResponse,
} from '@/types/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';

const dashboardSections = [
  {
    href: '/products',
    icon: Inventory2OutlinedIcon,
    translationKey: 'products',
    summaryKey: 'productsDescription',
  },
  {
    href: '/customers',
    icon: GroupOutlinedIcon,
    translationKey: 'customers',
    summaryKey: 'customersDescription',
  },
  {
    href: '/orders',
    icon: ReceiptLongOutlinedIcon,
    translationKey: 'orders',
    summaryKey: 'ordersDescription',
  },
  {
    href: '/suppliers',
    icon: LocalShippingOutlinedIcon,
    translationKey: 'suppliers',
    summaryKey: 'suppliersDescription',
  },
  {
    href: '/purchase-orders',
    icon: WarehouseOutlinedIcon,
    translationKey: 'purchaseOrders',
    summaryKey: 'purchaseOrdersDescription',
  },
] as const;

function sortByUpdatedAt<T extends { updatedAt: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

export default function DashboardPage() {
  const nav = useTranslations('nav');
  const t = useTranslations('dashboard');
  const ordersMessages = useTranslations('orders');
  const locale = useLocale();
  const organization = useOrganization();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activeOrganizationId = organization.activeOrganization?.id;

    if (!activeOrganizationId) {
      return;
    }

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [productsData, customersData, ordersData, suppliersData, purchaseOrdersData] =
          await Promise.all([
          productsService.list(activeOrganizationId),
          customersService.list(activeOrganizationId),
          ordersService.list(activeOrganizationId),
          suppliersService.list(activeOrganizationId),
          purchaseOrdersService.list(activeOrganizationId),
        ]);

        setProducts(productsData);
        setCustomers(customersData);
        setOrders(sortByUpdatedAt(ordersData));
        setSuppliers(suppliersData);
        setPurchaseOrders(sortByUpdatedAt(purchaseOrdersData));
      } catch (loadError) {
        setError(getErrorMessage(loadError, t('loadError')));
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [organization.activeOrganization?.id, t]);

  const completedRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + Number(order.total), 0),
    [orders],
  );

  const recentOrders = orders.slice(0, 5);

  return (
    <AppShell title={t('title')} description={t('subtitle')}>
      {!organization.activeOrganization ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: '#5C6B40',
            color: '#FAF7F0',
            boxShadow: '0 18px 40px rgba(60, 73, 40, 0.18)',
          }}
        >
          <Chip
            label={t('onboarding')}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit', fontWeight: 700 }}
          />
          <Typography variant="h5" sx={{ mt: 2, fontWeight: 750, letterSpacing: '-0.035em' }}>
            {t('welcomeTitle')}
          </Typography>
          <Typography sx={{ mt: 1, maxWidth: 580, color: 'rgba(250,247,240,0.82)' }}>
            {t('welcomeDescription')}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              bgcolor: '#5C6B40',
              color: '#FAF7F0',
              boxShadow: '0 18px 40px rgba(60, 73, 40, 0.18)',
            }}
          >
            <Chip
              label={t('organizationReady')}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit', fontWeight: 700 }}
            />
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 750, letterSpacing: '-0.035em' }}>
              {organization.activeOrganization.name}
            </Typography>
            <Typography sx={{ mt: 1, maxWidth: 620, color: 'rgba(250,247,240,0.82)' }}>
              {t('organizationCreated')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3 }}>
              <Chip label={`${nav('products')}: ${products.length}`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit' }} />
              <Chip label={`${nav('customers')}: ${customers.length}`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit' }} />
              <Chip label={`${nav('orders')}: ${orders.length}`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit' }} />
              <Chip label={`${nav('suppliers')}: ${suppliers.length}`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit' }} />
              <Chip label={`${nav('purchaseOrders')}: ${purchaseOrders.length}`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit' }} />
            </Box>
          </Paper>

          {error ? (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { label: nav('products'), value: products.length, helper: t('productsKpi') },
              { label: nav('customers'), value: customers.length, helper: t('customersKpi') },
              { label: nav('orders'), value: orders.length, helper: t('ordersKpi') },
              {
                label: t('completedRevenue'),
                value: formatAmount(completedRevenue, locale),
                helper: t('completedRevenueHint'),
              },
              { label: nav('suppliers'), value: suppliers.length, helper: t('suppliersKpi') },
              {
                label: nav('purchaseOrders'),
                value: purchaseOrders.length,
                helper: t('purchaseOrdersKpi'),
              },
            ].map(({ label, value, helper }) => (
              <Paper key={label} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="body2" sx={{ color: '#8B8577', fontWeight: 700 }}>
                  {label}
                </Typography>
                <Typography sx={{ mt: 1, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  {value}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#6B6455' }}>
                  {helper}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {dashboardSections.map(({ href, icon: Icon, summaryKey, translationKey }) => (
              <Paper key={href} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 2.5,
                    bgcolor: 'rgba(168,192,144,0.24)',
                    color: '#5C6B40',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography sx={{ mt: 2, fontWeight: 750 }}>{nav(translationKey)}</Typography>
                <Typography variant="body2" sx={{ mt: 0.75, color: '#777266', lineHeight: 1.55 }}>
                  {t(summaryKey)}
                </Typography>
                <Link href={href} style={{ textDecoration: 'none' }}>
                  <Button endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2, px: 0 }}>
                    {t('manageSection')}
                  </Button>
                </Link>
              </Paper>
            ))}
          </Box>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 750 }}>{t('activityTitle')}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
              {isLoading ? t('loadingOrganization') : t('activityDescription')}
            </Typography>

            {recentOrders.length === 0 ? (
              <Typography variant="body2" sx={{ mt: 3, color: '#6B6455' }}>
                {ordersMessages('noOrders')}
              </Typography>
            ) : (
              <Stack spacing={2} sx={{ mt: 3 }}>
                {recentOrders.map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      gap: 1.5,
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(92,107,64,0.04)',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>#{order.id.slice(0, 8)}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.4, color: '#777266' }}>
                        {formatDateTime(order.updatedAt, locale)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {formatAmount(order.total, locale)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.4, color: '#777266' }}>
                        {ordersMessages(order.status.toLowerCase())}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      )}
    </AppShell>
  );
}
