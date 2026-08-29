'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppShell } from '@/components/app-shell';
import { useOrganization } from '@/context/organization.context';
import { getErrorMessage } from '@/lib/api-error';
import { formatAmount, formatDateTime } from '@/lib/format';
import { customersService } from '@/services/customers.service';
import { ordersService } from '@/services/orders.service';
import { productsService } from '@/services/products.service';
import type {
  CustomerResponse,
  CreateOrderRequest,
  OrderResponse,
  OrderStatus,
  ProductResponse,
} from '@/types/api';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

interface OrderFormItem {
  productId: string;
  quantity: string;
}

const initialOrderItems: OrderFormItem[] = [{ productId: '', quantity: '1' }];

function sortOrders(orders: OrderResponse[]): OrderResponse[] {
  return [...orders].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function getLifecycleActions(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case 'DRAFT':
      return ['PENDING', 'CANCELLED'];
    case 'PENDING':
      return ['CONFIRMED', 'CANCELLED'];
    case 'CONFIRMED':
      return ['COMPLETED', 'CANCELLED'];
    default:
      return [];
  }
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'CONFIRMED':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'default';
    default:
      return 'secondary';
  }
}

function buildOrderPayload(customerId: string, items: OrderFormItem[]): CreateOrderRequest {
  return {
    customerId,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
    })),
  };
}

function getLocalizedOrderError(
  error: unknown,
  fallback: string,
  translate: ReturnType<typeof useTranslations<'orders'>>,
): string {
  return getErrorMessage(error, fallback, (message) => {
    const insufficientStock = /^Insufficient stock for product "(.+)"$/.exec(message);
    return insufficientStock
      ? translate('insufficientStock', { product: insufficientStock[1] })
      : undefined;
  });
}

export default function OrdersPage() {
  const t = useTranslations('orders');
  const common = useTranslations('common');
  const locale = useLocale();
  const organization = useOrganization();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<OrderFormItem[]>(initialOrderItems);

  useEffect(() => {
    const activeOrganizationId = organization.activeOrganization?.id;

    if (!activeOrganizationId) {
      return;
    }

    const loadOrdersPage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [ordersData, customersData, productsData] = await Promise.all([
          ordersService.list(activeOrganizationId),
          customersService.list(activeOrganizationId),
          productsService.list(activeOrganizationId),
        ]);

        setOrders(sortOrders(ordersData));
        setCustomers([...customersData].sort((left, right) => left.name.localeCompare(right.name)));
        setProducts([...productsData].sort((left, right) => left.name.localeCompare(right.name)));
      } catch (loadError) {
        setError(getErrorMessage(loadError, t('loadError')));
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrdersPage();
  }, [organization.activeOrganization?.id, t]);

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === 'ACTIVE'),
    [products],
  );

  const canCreateOrder = customers.length > 0 && activeProducts.length > 0;

  const handleOpenCreate = () => {
    setCustomerId(customers[0]?.id ?? '');
    setItems(initialOrderItems);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false);
      setCustomerId('');
      setItems(initialOrderItems);
    }
  };

  const handleAddItem = () => {
    setItems((current) => [...current, { productId: '', quantity: '1' }]);
  };

  const handleItemChange = (index: number, field: keyof OrderFormItem, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organization.activeOrganization) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const savedOrder = await ordersService.create(
        organization.activeOrganization.id,
        buildOrderPayload(customerId, items),
      );

      setOrders((currentOrders) => sortOrders([savedOrder, ...currentOrders]));
      setIsDialogOpen(false);
      setCustomerId('');
      setItems(initialOrderItems);
    } catch (submitError) {
      setError(getLocalizedOrderError(submitError, t('createError'), t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusTransition = async (orderId: string, status: OrderStatus) => {
    if (!organization.activeOrganization) {
      return;
    }

    setUpdatingOrderId(orderId);
    setError(null);

    try {
      const updatedOrder = await ordersService.updateStatus(
        organization.activeOrganization.id,
        orderId,
        status,
      );

      setOrders((currentOrders) =>
        sortOrders(
          currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
        ),
      );
    } catch (submitError) {
      setError(getLocalizedOrderError(submitError, t('updateError'), t));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <AppShell
      title={t('title')}
      description={t('subtitle')}
      action={
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          disabled={!organization.activeOrganization || !canCreateOrder}
        >
          {t('create')}
        </Button>
      }
    >
      {!organization.activeOrganization ? (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 750 }}>
            {t('emptyOrganizationTitle')}
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            {t('emptyOrganizationDescription')}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {!canCreateOrder ? (
            <Alert severity="info">
              {customers.length === 0 ? t('requiresCustomer') : t('requiresProduct')}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { label: t('totalOrders'), value: orders.length },
              { label: t('draftOrders'), value: orders.filter((order) => order.status === 'DRAFT').length },
              { label: t('activeOrders'), value: orders.filter((order) => ['PENDING', 'CONFIRMED'].includes(order.status)).length },
              { label: t('completedOrders'), value: orders.filter((order) => order.status === 'COMPLETED').length },
            ].map(({ label, value }) => (
              <Paper key={label} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="body2" sx={{ color: '#8B8577', fontWeight: 700 }}>
                  {label}
                </Typography>
                <Typography sx={{ mt: 1, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  {value}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Stack spacing={2}>
            {isLoading ? (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, display: 'grid', placeItems: 'center' }}>
                <CircularProgress />
              </Paper>
            ) : orders.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
                <Typography sx={{ color: 'text.secondary' }}>{t('noOrders')}</Typography>
              </Paper>
            ) : (
              orders.map((order) => (
                <Paper key={order.id} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', lg: 'row' },
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 750 }}>
                          #{order.id.slice(0, 8)}
                        </Typography>
                        <Chip
                          label={t(order.status.toLowerCase())}
                          color={getStatusColor(order.status)}
                          variant={order.status === 'CANCELLED' ? 'outlined' : 'filled'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 0.8, color: '#777266' }}>
                        {t('customer')}: {customerMap.get(order.customerId)?.name ?? order.customerId}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                        {t('updatedAt')}: {formatDateTime(order.updatedAt, locale)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: { xs: 'flex-start', lg: 'flex-end' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 750, minWidth: { sm: 100 } }}>
                        {formatAmount(order.total, locale)}
                      </Typography>
                      {getLifecycleActions(order.status).map((status) => (
                        <Button
                          key={status}
                          size="small"
                          variant={status === 'CANCELLED' ? 'outlined' : 'contained'}
                          color={status === 'CANCELLED' ? 'inherit' : 'primary'}
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleStatusTransition(order.id, status)}
                        >
                          {t(`action${status.charAt(0)}${status.slice(1).toLowerCase()}`)}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  <Typography sx={{ fontWeight: 700 }}>{t('snapshotTitle')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                    {t('snapshotDescription')}
                  </Typography>

                  <Box sx={{ overflowX: 'auto', mt: 2 }}>
                    <Table sx={{ minWidth: 760 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('product')}</TableCell>
                          <TableCell>{t('sku')}</TableCell>
                          <TableCell>{t('quantity')}</TableCell>
                          <TableCell>{t('unitPrice')}</TableCell>
                          <TableCell>{t('lineTotal')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography sx={{ fontWeight: 700 }}>{item.productName}</Typography>
                              {item.productDescription ? (
                                <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                                  {item.productDescription}
                                </Typography>
                              ) : null}
                            </TableCell>
                            <TableCell>{item.productSku ?? '—'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatAmount(item.unitPrice, locale)}</TableCell>
                            <TableCell>{formatAmount(item.total, locale)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              ))
            )}
          </Stack>
        </Stack>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{t('createTitle')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <FormControl fullWidth required>
                <Typography variant="body2" sx={{ mb: 1, color: '#6B6455', fontWeight: 600 }}>
                  {t('customer')}
                </Typography>
                <Select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 700 }}>{t('items')}</Typography>
                  <Button startIcon={<AddRoundedIcon />} onClick={handleAddItem}>
                    {t('addItem')}
                  </Button>
                </Box>

                {items.map((item, index) => {
                  const selectedProductIds = items
                    .map((entry, entryIndex) => (entryIndex === index ? '' : entry.productId))
                    .filter(Boolean);

                  const availableProducts = activeProducts.filter(
                    (product) =>
                      product.id === item.productId || !selectedProductIds.includes(product.id),
                  );

                  return (
                    <Paper key={`${index}-${item.productId}`} elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr auto' },
                          gap: 2,
                          alignItems: 'center',
                        }}
                      >
                        <FormControl fullWidth required>
                          <Typography variant="body2" sx={{ mb: 1, color: '#6B6455', fontWeight: 600 }}>
                            {t('product')}
                          </Typography>
                          <Select
                            value={item.productId}
                            onChange={(event) =>
                              handleItemChange(index, 'productId', event.target.value)
                            }
                          >
                            {availableProducts.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {product.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          required
                          label={t('quantity')}
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(index, 'quantity', event.target.value)
                          }
                          slotProps={{ htmlInput: { min: 1, step: 1 } }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: { xs: 0, md: 3 } }}>
                          <IconButton
                            aria-label={t('removeItem')}
                            disabled={items.length === 1}
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteOutlineRoundedIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={isSubmitting} onClick={handleCloseDialog}>
              {common('cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmitting ||
                !customerId ||
                items.some((item) => !item.productId || Number(item.quantity) < 1)
              }
              startIcon={
                isSubmitting ? <CircularProgress color="inherit" size={16} /> : undefined
              }
            >
              {common('create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppShell>
  );
}
