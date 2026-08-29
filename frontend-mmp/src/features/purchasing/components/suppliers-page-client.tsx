'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppShell } from '@/components/app-shell';
import { useOrganization } from '@/context/organization.context';
import { getErrorMessage } from '@/lib/api-error';
import { formatDateTime } from '@/lib/format';
import { suppliersService } from '@/services/suppliers.service';
import type { SupplierResponse, SupplierUpsertRequest } from '@/types/api';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

interface SupplierFormState {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
}

const initialFormState: SupplierFormState = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  taxId: '',
  address: '',
};

function sortSuppliers(suppliers: SupplierResponse[]): SupplierResponse[] {
  return [...suppliers].sort((left, right) => left.name.localeCompare(right.name));
}

function toSupplierPayload(form: SupplierFormState): SupplierUpsertRequest {
  return {
    name: form.name.trim(),
    contactName: form.contactName.trim() || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    taxId: form.taxId.trim() || undefined,
    address: form.address.trim() || undefined,
  };
}

export default function SuppliersPage() {
  const t = useTranslations('suppliers');
  const common = useTranslations('common');
  const locale = useLocale();
  const organization = useOrganization();
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<SupplierResponse | null>(null);
  const [supplierPendingDelete, setSupplierPendingDelete] = useState<SupplierResponse | null>(null);
  const [form, setForm] = useState<SupplierFormState>(initialFormState);

  useEffect(() => {
    const activeOrganizationId = organization.activeOrganization?.id;

    if (!activeOrganizationId) {
      return;
    }

    const loadSuppliers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        setSuppliers(sortSuppliers(await suppliersService.list(activeOrganizationId)));
      } catch (loadError) {
        setError(getErrorMessage(loadError, t('loadError')));
      } finally {
        setIsLoading(false);
      }
    };

    void loadSuppliers();
  }, [organization.activeOrganization?.id, t]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setForm(initialFormState);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (supplier: SupplierResponse) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contactName: supplier.contactName ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      taxId: supplier.taxId ?? '',
      address: supplier.address ?? '',
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false);
      setEditingSupplier(null);
      setForm(initialFormState);
    }
  };

  const handleOpenDelete = (supplier: SupplierResponse) => {
    setSupplierPendingDelete(supplier);
    setError(null);
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setSupplierPendingDelete(null);
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
      const payload = toSupplierPayload(form);
      const savedSupplier = editingSupplier
        ? await suppliersService.update(
            organization.activeOrganization.id,
            editingSupplier.id,
            payload,
          )
        : await suppliersService.create(organization.activeOrganization.id, payload);

      setSuppliers((currentSuppliers) => {
        const nextSuppliers = editingSupplier
          ? currentSuppliers.map((supplier) =>
              supplier.id === savedSupplier.id ? savedSupplier : supplier,
            )
          : [...currentSuppliers, savedSupplier];

        return sortSuppliers(nextSuppliers);
      });

      setIsDialogOpen(false);
      setEditingSupplier(null);
      setForm(initialFormState);
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          editingSupplier ? t('updateError') : t('createError'),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!organization.activeOrganization || !supplierPendingDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await suppliersService.delete(
        organization.activeOrganization.id,
        supplierPendingDelete.id,
      );
      setSuppliers((currentSuppliers) =>
        currentSuppliers.filter((supplier) => supplier.id !== supplierPendingDelete.id),
      );
      setSupplierPendingDelete(null);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, t('deleteError')));
    } finally {
      setIsDeleting(false);
    }
  };

  const suppliersWithEmail = suppliers.filter((supplier) => supplier.email).length;
  const suppliersWithContact = suppliers.filter(
    (supplier) => supplier.contactName || supplier.phone,
  ).length;

  return (
    <AppShell
      title={t('title')}
      description={t('subtitle')}
      action={
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          disabled={!organization.activeOrganization}
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

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { label: t('supplierCount'), value: suppliers.length },
              { label: t('withEmailCount'), value: suppliersWithEmail },
              { label: t('withContactCount'), value: suppliersWithContact },
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
            ) : suppliers.length === 0 ? (
              <Box sx={{ p: 4 }}>
                <Typography sx={{ color: 'text.secondary' }}>{t('noSuppliers')}</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 920 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('name')}</TableCell>
                      <TableCell>{t('contactName')}</TableCell>
                      <TableCell>{t('email')}</TableCell>
                      <TableCell>{t('phone')}</TableCell>
                      <TableCell>{t('taxId')}</TableCell>
                      <TableCell>{t('updatedAt')}</TableCell>
                      <TableCell align="right">{common('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{supplier.name}</Typography>
                          {supplier.address ? (
                            <Typography variant="body2" sx={{ mt: 0.5, color: '#777266' }}>
                              {supplier.address}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>{supplier.contactName ?? '—'}</TableCell>
                        <TableCell>{supplier.email ?? '—'}</TableCell>
                        <TableCell>{supplier.phone ?? '—'}</TableCell>
                        <TableCell>{supplier.taxId ?? '—'}</TableCell>
                        <TableCell>{formatDateTime(supplier.updatedAt, locale)}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}
                          >
                            <Button size="small" onClick={() => handleOpenEdit(supplier)}>
                              {common('edit')}
                            </Button>
                            <Button
                              size="small"
                              color="inherit"
                              disabled={isDeleting && supplierPendingDelete?.id === supplier.id}
                              onClick={() => handleOpenDelete(supplier)}
                            >
                              {common('delete')}
                            </Button>
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
          <DialogTitle>{editingSupplier ? t('editTitle') : t('createTitle')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                autoFocus
                required
                label={t('name')}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
              <TextField
                label={t('contactName')}
                value={form.contactName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contactName: event.target.value }))
                }
              />
              <TextField
                label={t('email')}
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <TextField
                  label={t('phone')}
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
                <TextField
                  label={t('taxId')}
                  value={form.taxId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, taxId: event.target.value }))
                  }
                />
              </Box>
              <TextField
                label={t('address')}
                multiline
                minRows={3}
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({ ...current, address: event.target.value }))
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={isSubmitting} onClick={handleCloseDialog}>
              {common('cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {common('save')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(supplierPendingDelete)}
        onClose={handleCloseDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ pt: 1 }}>
            {t('deleteDescription', { name: supplierPendingDelete?.name ?? '' })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={isDeleting} onClick={handleCloseDeleteDialog}>
            {common('cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={handleDeleteSupplier}
          >
            {common('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
