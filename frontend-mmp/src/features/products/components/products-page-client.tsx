'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppShell } from '@/components/app-shell';
import { useOrganization } from '@/context/organization.context';
import { getErrorMessage } from '@/lib/api-error';
import { formatAmount, formatDateTime } from '@/lib/format';
import { productsService } from '@/services/products.service';
import type { ProductResponse, ProductUpsertRequest } from '@/types/api';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

interface ProductFormState {
  name: string;
  description: string;
  sku: string;
  price: string;
  stock: string;
}

const initialFormState: ProductFormState = {
  name: '',
  description: '',
  sku: '',
  price: '',
  stock: '0',
};

function toProductPayload(form: ProductFormState): ProductUpsertRequest {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    sku: form.sku.trim() || undefined,
    price: Number(form.price),
    stock: Number(form.stock || '0'),
  };
}

function sortProducts(products: ProductResponse[]): ProductResponse[] {
  return [...products].sort((left, right) => left.name.localeCompare(right.name));
}

export default function ProductsPage() {
  const t = useTranslations('products');
  const common = useTranslations('common');
  const locale = useLocale();
  const organization = useOrganization();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  useEffect(() => {
    const activeOrganizationId = organization.activeOrganization?.id;

    if (!activeOrganizationId) {
      return;
    }

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        setProducts(sortProducts(await productsService.list(activeOrganizationId)));
      } catch (loadError) {
        setError(getErrorMessage(loadError, t('loadError')));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, [organization.activeOrganization?.id, t]);

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === 'ACTIVE').length,
    [products],
  );

  const inactiveProducts = products.length - activeProducts;

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm(initialFormState);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? '',
      sku: product.sku ?? '',
      price: product.price,
      stock: String(product.stock),
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false);
      setEditingProduct(null);
      setForm(initialFormState);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organization.activeOrganization) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = toProductPayload(form);
      const savedProduct = editingProduct
        ? await productsService.update(
            organization.activeOrganization.id,
            editingProduct.id,
            payload,
          )
        : await productsService.create(organization.activeOrganization.id, payload);

      setProducts((currentProducts) => {
        const nextProducts = editingProduct
          ? currentProducts.map((product) =>
              product.id === savedProduct.id ? savedProduct : product,
            )
          : [...currentProducts, savedProduct];

        return sortProducts(nextProducts);
      });

      setIsDialogOpen(false);
      setEditingProduct(null);
      setForm(initialFormState);
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          editingProduct ? t('updateError') : t('createError'),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (productId: string) => {
    if (!organization.activeOrganization) {
      return;
    }

    setUpdatingProductId(productId);
    setError(null);

    try {
      const updatedProduct = await productsService.deactivate(
        organization.activeOrganization.id,
        productId,
      );

      setProducts((currentProducts) =>
        sortProducts(
          currentProducts.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          ),
        ),
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('deactivateError')));
    } finally {
      setUpdatingProductId(null);
    }
  };

  return (
    <AppShell
      title={t('title')}
      description={t('subtitle')}
      action={
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate}>
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { label: t('catalogCount'), value: products.length },
              { label: t('activeCount'), value: activeProducts },
              { label: t('inactiveCount'), value: inactiveProducts },
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

          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(92,107,64,0.12)' }}>
              <Typography sx={{ fontWeight: 750 }}>{t('listTitle')}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                {t('listDescription')}
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}>
                <CircularProgress />
              </Box>
            ) : products.length === 0 ? (
              <Box sx={{ p: 4 }}>
                <Typography sx={{ color: 'text.secondary' }}>{t('noProducts')}</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('name')}</TableCell>
                      <TableCell>{t('sku')}</TableCell>
                      <TableCell>{t('price')}</TableCell>
                      <TableCell>{t('stock')}</TableCell>
                      <TableCell>{t('status')}</TableCell>
                      <TableCell>{t('updatedAt')}</TableCell>
                      <TableCell align="right">{common('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>
                          {product.description ? (
                            <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                              {product.description}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>{product.sku ?? '—'}</TableCell>
                        <TableCell>{formatAmount(product.price, locale)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              product.status === 'ACTIVE' ? t('active') : t('inactive')
                            }
                            size="small"
                            color={product.status === 'ACTIVE' ? 'success' : 'default'}
                            variant={product.status === 'ACTIVE' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>{formatDateTime(product.updatedAt, locale)}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              justifyContent: 'flex-end',
                              gap: 1,
                            }}
                          >
                            <Button size="small" onClick={() => handleOpenEdit(product)}>
                              {common('edit')}
                            </Button>
                            {product.status === 'ACTIVE' ? (
                              <Button
                                size="small"
                                color="inherit"
                                disabled={updatingProductId === product.id}
                                onClick={() => handleDeactivate(product.id)}
                              >
                                {updatingProductId === product.id ? t('deactivating') : t('deactivate')}
                              </Button>
                            ) : null}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Paper>
        </Stack>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editingProduct ? t('editTitle') : t('createTitle')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                required
                label={t('name')}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
              <TextField
                label={t('description')}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                multiline
                minRows={3}
              />
              <TextField
                label={t('sku')}
                value={form.sku}
                onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <TextField
                  required
                  label={t('price')}
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
                <TextField
                  required
                  label={t('stock')}
                  type="number"
                  value={form.stock}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, stock: event.target.value }))
                  }
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={isSubmitting} onClick={handleCloseDialog}>
              {common('cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress color="inherit" size={16} /> : undefined
              }
            >
              {editingProduct ? common('save') : common('create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppShell>
  );
}
