'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppShell } from '@/components/app-shell';
import { useOrganization } from '@/context/organization.context';
import { getErrorMessage } from '@/lib/api-error';
import { formatAmount, formatDateTime } from '@/lib/format';
import { productsService } from '@/services/products.service';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { suppliersService } from '@/services/suppliers.service';
import type {
  CreatePurchaseOrderRequest,
  ProductResponse,
  PurchaseOrderResponse,
  PurchaseOrderStatus,
  ReceivePurchaseOrderRequest,
  SupplierResponse,
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

interface PurchaseOrderFormItem {
  productId: string;
  quantity: string;
  unitCost: string;
}

interface ReceiptFormItem {
  purchaseOrderItemId: string;
  quantity: string;
}

const initialPurchaseOrderItems: PurchaseOrderFormItem[] = [
  { productId: '', quantity: '1', unitCost: '' },
];

function sortPurchaseOrders(purchaseOrders: PurchaseOrderResponse[]): PurchaseOrderResponse[] {
  return [...purchaseOrders].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function getLifecycleActions(status: PurchaseOrderStatus): PurchaseOrderStatus[] {
  switch (status) {
    case 'DRAFT':
      return ['ORDERED', 'CANCELLED'];
    case 'ORDERED':
      return ['CANCELLED'];
    default:
      return [];
  }
}

function canReceivePurchaseOrder(status: PurchaseOrderStatus): boolean {
  return status === 'ORDERED' || status === 'PARTIALLY_RECEIVED';
}

function getStatusColor(status: PurchaseOrderStatus) {
  switch (status) {
    case 'RECEIVED':
      return 'success';
    case 'PARTIALLY_RECEIVED':
      return 'warning';
    case 'ORDERED':
      return 'info';
    case 'CANCELLED':
      return 'default';
    default:
      return 'secondary';
  }
}

function getRemainingQuantity(orderedQuantity: number, receivedQuantity: number): number {
  return Math.max(orderedQuantity - receivedQuantity, 0);
}

function buildPurchaseOrderPayload(
  supplierId: string,
  items: PurchaseOrderFormItem[],
): CreatePurchaseOrderRequest {
  return {
    supplierId,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost),
    })),
  };
}

function buildReceiptPayload(
  reference: string,
  notes: string,
  items: ReceiptFormItem[],
): ReceivePurchaseOrderRequest {
  return {
    reference: reference.trim() || undefined,
    notes: notes.trim() || undefined,
    items: items
      .map((item) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.quantity > 0),
  };
}

function getLocalizedPurchaseOrderError(
  error: unknown,
  fallback: string,
  translate: ReturnType<typeof useTranslations<'purchaseOrders'>>,
): string {
  return getErrorMessage(error, fallback, (message) => {
    const receivedQuantityExceeded =
      /^Received quantity for product "(.+)" exceeds ordered quantity$/.exec(message);

    if (receivedQuantityExceeded) {
      return translate('receivedQuantityExceeded', { product: receivedQuantityExceeded[1] });
    }

    switch (message) {
      case 'Purchase order must contain at least one item':
        return translate('requiresItems');
      case 'Purchase receipt must contain at least one item':
        return translate('receiptRequiresSelection');
      case 'Purchase order must be ordered before receiving items':
        return translate('mustBeOrderedBeforeReceiving');
      case 'Cancelled purchase orders cannot receive items':
        return translate('cancelledCannotReceive');
      case 'Received purchase orders cannot receive items':
        return translate('receivedCannotReceive');
      default:
        return undefined;
    }
  });
}

export default function PurchaseOrdersPage() {
  const t = useTranslations('purchaseOrders');
  const common = useTranslations('common');
  const locale = useLocale();
  const organization = useOrganization();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [updatingPurchaseOrderId, setUpdatingPurchaseOrderId] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<PurchaseOrderFormItem[]>(initialPurchaseOrderItems);
  const [receivingPurchaseOrder, setReceivingPurchaseOrder] = useState<PurchaseOrderResponse | null>(
    null,
  );
  const [receiptReference, setReceiptReference] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [receiptItems, setReceiptItems] = useState<ReceiptFormItem[]>([]);

  useEffect(() => {
    const activeOrganizationId = organization.activeOrganization?.id;

    if (!activeOrganizationId) {
      return;
    }

    const loadPurchaseOrdersPage = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const [purchaseOrdersData, suppliersData, productsData] = await Promise.all([
          purchaseOrdersService.list(activeOrganizationId),
          suppliersService.list(activeOrganizationId),
          productsService.list(activeOrganizationId),
        ]);

        setPurchaseOrders(sortPurchaseOrders(purchaseOrdersData));
        setSuppliers([...suppliersData].sort((left, right) => left.name.localeCompare(right.name)));
        setProducts([...productsData].sort((left, right) => left.name.localeCompare(right.name)));
      } catch (loadError) {
        setPageError(getLocalizedPurchaseOrderError(loadError, t('loadError'), t));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPurchaseOrdersPage();
  }, [organization.activeOrganization?.id, t]);

  const supplierMap = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers],
  );

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === 'ACTIVE'),
    [products],
  );

  const canCreatePurchaseOrder = suppliers.length > 0 && activeProducts.length > 0;

  const totalOrderedUnits = useMemo(
    () =>
      purchaseOrders.reduce(
        (sum, purchaseOrder) =>
          sum +
          purchaseOrder.items.reduce((itemSum, item) => itemSum + item.orderedQuantity, 0),
        0,
      ),
    [purchaseOrders],
  );

  const totalReceivedUnits = useMemo(
    () =>
      purchaseOrders.reduce(
        (sum, purchaseOrder) =>
          sum +
          purchaseOrder.items.reduce((itemSum, item) => itemSum + item.receivedQuantity, 0),
        0,
      ),
    [purchaseOrders],
  );

  const handleOpenCreate = () => {
    setSupplierId(suppliers[0]?.id ?? '');
    setItems(initialPurchaseOrderItems);
    setCreateError(null);
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    if (!isSubmittingCreate) {
      setIsCreateDialogOpen(false);
      setSupplierId('');
      setItems(initialPurchaseOrderItems);
      setCreateError(null);
    }
  };

  const handleAddItem = () => {
    setItems((current) => [...current, { productId: '', quantity: '1', unitCost: '' }]);
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderFormItem,
    value: string,
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleCreatePurchaseOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organization.activeOrganization) {
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError(null);

    try {
      const savedPurchaseOrder = await purchaseOrdersService.create(
        organization.activeOrganization.id,
        buildPurchaseOrderPayload(supplierId, items),
      );

      setPurchaseOrders((currentPurchaseOrders) =>
        sortPurchaseOrders([savedPurchaseOrder, ...currentPurchaseOrders]),
      );
      setIsCreateDialogOpen(false);
      setSupplierId('');
      setItems(initialPurchaseOrderItems);
    } catch (submitError) {
      setCreateError(getLocalizedPurchaseOrderError(submitError, t('createError'), t));
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleStatusTransition = async (
    purchaseOrderId: string,
    status: PurchaseOrderStatus,
  ) => {
    if (!organization.activeOrganization) {
      return;
    }

    setUpdatingPurchaseOrderId(purchaseOrderId);
    setPageError(null);

    try {
      const updatedPurchaseOrder = await purchaseOrdersService.updateStatus(
        organization.activeOrganization.id,
        purchaseOrderId,
        status,
      );

      setPurchaseOrders((currentPurchaseOrders) =>
        sortPurchaseOrders(
          currentPurchaseOrders.map((purchaseOrder) =>
            purchaseOrder.id === updatedPurchaseOrder.id ? updatedPurchaseOrder : purchaseOrder,
          ),
        ),
      );
    } catch (submitError) {
      setPageError(getLocalizedPurchaseOrderError(submitError, t('updateError'), t));
    } finally {
      setUpdatingPurchaseOrderId(null);
    }
  };

  const handleOpenReceiptDialog = (purchaseOrder: PurchaseOrderResponse) => {
    setReceivingPurchaseOrder(purchaseOrder);
    setReceiptReference('');
    setReceiptNotes('');
    setReceiptItems(
      purchaseOrder.items.map((item) => ({
        purchaseOrderItemId: item.id,
        quantity: '',
      })),
    );
    setReceiptError(null);
    setIsReceiptDialogOpen(true);
  };

  const handleCloseReceiptDialog = () => {
    if (!isSubmittingReceipt) {
      setIsReceiptDialogOpen(false);
      setReceivingPurchaseOrder(null);
      setReceiptReference('');
      setReceiptNotes('');
      setReceiptItems([]);
      setReceiptError(null);
    }
  };

  const handleReceiptItemChange = (purchaseOrderItemId: string, quantity: string) => {
    setReceiptItems((current) =>
      current.map((item) =>
        item.purchaseOrderItemId === purchaseOrderItemId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleSubmitReceipt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organization.activeOrganization || !receivingPurchaseOrder) {
      return;
    }

    const payload = buildReceiptPayload(receiptReference, receiptNotes, receiptItems);

    if (payload.items.length === 0) {
      setReceiptError(t('receiptRequiresSelection'));
      return;
    }

    setIsSubmittingReceipt(true);
    setReceiptError(null);

    try {
      const updatedPurchaseOrder = await purchaseOrdersService.receive(
        organization.activeOrganization.id,
        receivingPurchaseOrder.id,
        payload,
      );

      setPurchaseOrders((currentPurchaseOrders) =>
        sortPurchaseOrders(
          currentPurchaseOrders.map((purchaseOrder) =>
            purchaseOrder.id === updatedPurchaseOrder.id ? updatedPurchaseOrder : purchaseOrder,
          ),
        ),
      );

      setIsReceiptDialogOpen(false);
      setReceivingPurchaseOrder(null);
      setReceiptReference('');
      setReceiptNotes('');
      setReceiptItems([]);
    } catch (submitError) {
      setReceiptError(getLocalizedPurchaseOrderError(submitError, t('receiveError'), t));
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const receivingQuantities = useMemo(
    () =>
      new Map(
        receiptItems.map((item) => [
          item.purchaseOrderItemId,
          Number(item.quantity || '0'),
        ]),
      ),
    [receiptItems],
  );

  return (
    <AppShell
      title={t('title')}
      description={t('subtitle')}
      action={
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          disabled={!organization.activeOrganization || !canCreatePurchaseOrder}
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
          {pageError ? <Alert severity="error">{pageError}</Alert> : null}

          {!canCreatePurchaseOrder ? (
            <Alert severity="info">
              {suppliers.length === 0 ? t('requiresSupplier') : t('requiresProduct')}
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
              { label: t('totalOrders'), value: purchaseOrders.length },
              {
                label: t('openOrders'),
                value: purchaseOrders.filter((purchaseOrder) =>
                  ['DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(purchaseOrder.status),
                ).length,
              },
              { label: t('totalOrderedUnits'), value: totalOrderedUnits },
              { label: t('totalReceivedUnits'), value: totalReceivedUnits },
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
            ) : purchaseOrders.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
                <Typography sx={{ color: 'text.secondary' }}>{t('noPurchaseOrders')}</Typography>
              </Paper>
            ) : (
              purchaseOrders.map((purchaseOrder) => {
                const supplier = supplierMap.get(purchaseOrder.supplierId);
                const totalReceivedLines = purchaseOrder.items.filter(
                  (item) => item.receivedQuantity === item.orderedQuantity,
                ).length;

                return (
                  <Paper key={purchaseOrder.id} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', xl: 'row' },
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
                            PO #{purchaseOrder.id.slice(0, 8)}
                          </Typography>
                          <Chip
                            label={t(purchaseOrder.status.toLowerCase())}
                            color={getStatusColor(purchaseOrder.status)}
                            variant={purchaseOrder.status === 'CANCELLED' ? 'outlined' : 'filled'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 0.8, color: '#777266' }}>
                          {t('supplier')}: {supplier?.name ?? purchaseOrder.supplierId}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                          {t('orderedAt')}: {purchaseOrder.orderedAt ? formatDateTime(purchaseOrder.orderedAt, locale) : '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                          {t('receivedAt')}: {purchaseOrder.receivedAt ? formatDateTime(purchaseOrder.receivedAt, locale) : '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                          {t('updatedAt')}: {formatDateTime(purchaseOrder.updatedAt, locale)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: { xs: 'stretch', xl: 'flex-end' },
                          gap: 1.25,
                        }}
                      >
                        <Typography sx={{ fontWeight: 750, textAlign: { xl: 'right' } }}>
                          {formatAmount(purchaseOrder.total, locale)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#777266', textAlign: { xl: 'right' } }}>
                          {t('receivedLines', {
                            received: totalReceivedLines,
                            total: purchaseOrder.items.length,
                          })}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: { xs: 'flex-start', xl: 'flex-end' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          {canReceivePurchaseOrder(purchaseOrder.status) ? (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={updatingPurchaseOrderId === purchaseOrder.id}
                              onClick={() => handleOpenReceiptDialog(purchaseOrder)}
                            >
                              {t('receiveAction')}
                            </Button>
                          ) : null}
                          {getLifecycleActions(purchaseOrder.status).map((status) => (
                            <Button
                              key={status}
                              size="small"
                              variant={status === 'CANCELLED' ? 'outlined' : 'contained'}
                              color={status === 'CANCELLED' ? 'inherit' : 'primary'}
                              disabled={updatingPurchaseOrderId === purchaseOrder.id}
                              onClick={() => handleStatusTransition(purchaseOrder.id, status)}
                            >
                              {t(
                                status === 'ORDERED' ? 'actionOrdered' : 'actionCancelled',
                              )}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    <Typography sx={{ fontWeight: 700 }}>{t('snapshotTitle')}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                      {t('snapshotDescription')}
                    </Typography>

                    <Box sx={{ overflowX: 'auto', mt: 2 }}>
                      <Table sx={{ minWidth: 980 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('product')}</TableCell>
                            <TableCell>{t('sku')}</TableCell>
                            <TableCell>{t('orderedQuantity')}</TableCell>
                            <TableCell>{t('receivedQuantity')}</TableCell>
                            <TableCell>{t('remainingQuantity')}</TableCell>
                            <TableCell>{t('unitCost')}</TableCell>
                            <TableCell>{t('lineTotal')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {purchaseOrder.items.map((item) => (
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
                              <TableCell>{item.orderedQuantity}</TableCell>
                              <TableCell>{item.receivedQuantity}</TableCell>
                              <TableCell>
                                {getRemainingQuantity(item.orderedQuantity, item.receivedQuantity)}
                              </TableCell>
                              <TableCell>{formatAmount(item.unitCost, locale)}</TableCell>
                              <TableCell>{formatAmount(item.total, locale)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    <Typography sx={{ fontWeight: 700 }}>{t('receiptHistoryTitle')}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                      {t('receiptHistoryDescription')}
                    </Typography>

                    {purchaseOrder.receipts.length === 0 ? (
                      <Typography variant="body2" sx={{ mt: 2, color: '#6B6455' }}>
                        {t('noReceipts')}
                      </Typography>
                    ) : (
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {purchaseOrder.receipts.map((receipt) => (
                          <Paper
                            key={receipt.id}
                            elevation={0}
                            sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(92,107,64,0.04)' }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                gap: 1.5,
                              }}
                            >
                              <Box>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {receipt.reference
                                    ? `${t('receiptReference')}: ${receipt.reference}`
                                    : t('receiptNoReference')}
                                </Typography>
                                {receipt.notes ? (
                                  <Typography variant="body2" sx={{ mt: 0.5, color: '#6B6455' }}>
                                    {receipt.notes}
                                  </Typography>
                                ) : null}
                              </Box>
                              <Typography variant="body2" sx={{ color: '#777266' }}>
                                {formatDateTime(receipt.receivedAt, locale)}
                              </Typography>
                            </Box>

                            <Box sx={{ overflowX: 'auto', mt: 1.5 }}>
                              <Table size="small" sx={{ minWidth: 420 }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>{t('product')}</TableCell>
                                    <TableCell>{t('receivedQuantity')}</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {receipt.items.map((receiptItem) => (
                                    <TableRow key={receiptItem.id}>
                                      <TableCell>{receiptItem.productName}</TableCell>
                                      <TableCell>{receiptItem.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                );
              })
            )}
          </Stack>
        </Stack>
      )}

      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog} fullWidth maxWidth="md">
        <Box component="form" onSubmit={handleCreatePurchaseOrder}>
          <DialogTitle>{t('createTitle')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {createError ? <Alert severity="error">{createError}</Alert> : null}
              <FormControl fullWidth required>
                <Typography variant="body2" sx={{ mb: 1, color: '#6B6455', fontWeight: 600 }}>
                  {t('supplier')}
                </Typography>
                <Select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
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
                          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr 1fr auto' },
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
                          label={t('orderedQuantity')}
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(index, 'quantity', event.target.value)
                          }
                          slotProps={{ htmlInput: { min: 1, step: 1 } }}
                        />

                        <TextField
                          required
                          label={t('unitCost')}
                          type="number"
                          value={item.unitCost}
                          onChange={(event) =>
                            handleItemChange(index, 'unitCost', event.target.value)
                          }
                          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: { xs: 0, lg: 3 } }}>
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
            <Button disabled={isSubmittingCreate} onClick={handleCloseCreateDialog}>
              {common('cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmittingCreate}>
              {common('save')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={isReceiptDialogOpen}
        onClose={handleCloseReceiptDialog}
        fullWidth
        maxWidth="md"
      >
        <Box component="form" onSubmit={handleSubmitReceipt}>
          <DialogTitle>{t('receiveTitle')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {receiptError ? <Alert severity="error">{receiptError}</Alert> : null}
              {receivingPurchaseOrder ? (
                <>
                  <Typography sx={{ color: '#6B6455' }}>
                    {t('receiveSubtitle', {
                      supplier:
                        supplierMap.get(receivingPurchaseOrder.supplierId)?.name ??
                        receivingPurchaseOrder.supplierId,
                    })}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label={t('receiptReference')}
                      value={receiptReference}
                      onChange={(event) => setReceiptReference(event.target.value)}
                    />
                    <TextField
                      label={t('receiptNotes')}
                      value={receiptNotes}
                      onChange={(event) => setReceiptNotes(event.target.value)}
                    />
                  </Box>

                  <Stack spacing={1.5}>
                    {receivingPurchaseOrder.items.map((item) => {
                      const remainingQuantity = getRemainingQuantity(
                        item.orderedQuantity,
                        item.receivedQuantity,
                      );
                      const plannedReceiptQuantity =
                        receivingQuantities.get(item.id) ?? 0;
                      const remainingAfterReceipt = Math.max(
                        remainingQuantity - plannedReceiptQuantity,
                        0,
                      );

                      return (
                        <Paper
                          key={item.id}
                          elevation={0}
                          sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FDFAF4' }}
                        >
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                              gap: 2,
                              alignItems: 'center',
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 700 }}>{item.productName}</Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                                {t('remainingSummary', {
                                  ordered: item.orderedQuantity,
                                  received: item.receivedQuantity,
                                  remaining: remainingQuantity,
                                })}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                                {t('remainingAfterReceipt', { remaining: remainingAfterReceipt })}
                              </Typography>
                            </Box>

                            <TextField
                              label={t('receiptQuantity')}
                              type="number"
                              disabled={remainingQuantity === 0}
                              value={
                                receiptItems.find(
                                  (receiptItem) => receiptItem.purchaseOrderItemId === item.id,
                                )?.quantity ?? ''
                              }
                              onChange={(event) =>
                                handleReceiptItemChange(item.id, event.target.value)
                              }
                              slotProps={{
                                htmlInput: {
                                  min: 0,
                                  max: remainingQuantity,
                                  step: 1,
                                },
                              }}
                              helperText={
                                remainingQuantity === 0
                                  ? t('fullyReceived')
                                  : t('receiptQuantityHint', { remaining: remainingQuantity })
                              }
                            />
                          </Box>
                        </Paper>
                      );
                    })}
                  </Stack>
                </>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={isSubmittingReceipt} onClick={handleCloseReceiptDialog}>
              {common('cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmittingReceipt}>
              {t('receiveSubmit')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppShell>
  );
}
