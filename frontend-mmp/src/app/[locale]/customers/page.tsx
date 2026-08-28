'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppShell } from '@/components/app-shell';
import { useOrganization } from '@/context/organization.context';
import { getErrorMessage } from '@/lib/api-error';
import { formatDateTime } from '@/lib/format';
import { customersService } from '@/services/customers.service';
import type { CustomerResponse, CustomerUpsertRequest } from '@/types/api';
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

interface CustomerFormState {
  name: string;
  email: string;
  phone: string;
}

const initialFormState: CustomerFormState = {
  name: '',
  email: '',
  phone: '',
};

function sortCustomers(customers: CustomerResponse[]): CustomerResponse[] {
  return [...customers].sort((left, right) => left.name.localeCompare(right.name));
}

function toCustomerPayload(form: CustomerFormState): CustomerUpsertRequest {
  return {
    name: form.name.trim(),
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
  };
}

export default function CustomersPage() {
  const t = useTranslations('customers');
  const common = useTranslations('common');
  const locale = useLocale();
  const organization = useOrganization();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
  const [form, setForm] = useState<CustomerFormState>(initialFormState);

  useEffect(() => {
    const activeOrganizationId = organization.activeOrganization?.id;

    if (!activeOrganizationId) {
      return;
    }

    const loadCustomers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        setCustomers(sortCustomers(await customersService.list(activeOrganizationId)));
      } catch (loadError) {
        setError(getErrorMessage(loadError, t('loadError')));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCustomers();
  }, [organization.activeOrganization?.id, t]);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setForm(initialFormState);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (customer: CustomerResponse) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false);
      setEditingCustomer(null);
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
      const payload = toCustomerPayload(form);
      const savedCustomer = editingCustomer
        ? await customersService.update(
            organization.activeOrganization.id,
            editingCustomer.id,
            payload,
          )
        : await customersService.create(organization.activeOrganization.id, payload);

      setCustomers((currentCustomers) => {
        const nextCustomers = editingCustomer
          ? currentCustomers.map((customer) =>
              customer.id === savedCustomer.id ? savedCustomer : customer,
            )
          : [...currentCustomers, savedCustomer];

        return sortCustomers(nextCustomers);
      });

      setIsDialogOpen(false);
      setEditingCustomer(null);
      setForm(initialFormState);
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          editingCustomer ? t('updateError') : t('createError'),
        ),
      );
    } finally {
      setIsSubmitting(false);
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
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { label: t('customerCount'), value: customers.length },
              {
                label: t('reachableCount'),
                value: customers.filter((customer) => customer.email || customer.phone).length,
              },
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
            ) : customers.length === 0 ? (
              <Box sx={{ p: 4 }}>
                <Typography sx={{ color: 'text.secondary' }}>{t('noCustomers')}</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('name')}</TableCell>
                      <TableCell>{t('email')}</TableCell>
                      <TableCell>{t('phone')}</TableCell>
                      <TableCell>{t('updatedAt')}</TableCell>
                      <TableCell align="right">{common('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{customer.name}</Typography>
                        </TableCell>
                        <TableCell>{customer.email ?? '—'}</TableCell>
                        <TableCell>{customer.phone ?? '—'}</TableCell>
                        <TableCell>{formatDateTime(customer.updatedAt, locale)}</TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => handleOpenEdit(customer)}>
                            {common('edit')}
                          </Button>
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
          <DialogTitle>{editingCustomer ? t('editTitle') : t('createTitle')}</DialogTitle>
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
                label={t('email')}
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
              <TextField
                label={t('phone')}
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
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
              {editingCustomer ? common('save') : common('create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppShell>
  );
}
