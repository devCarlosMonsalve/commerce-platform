'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useOrganization } from '@/context/organization.context';
import { getErrorMessage, getRetryAfterSeconds } from '@/lib/api-error';
import { aiService } from '@/services/ai.service';
import type {
  AiPurchaseSuggestionsResponse,
  OperationalSearchResponse,
  OperationsSummarySection,
} from '@/types/api';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface AiAssistantDrawerContentProps {
  pathname: string;
  title: string;
  onNavigate: () => void;
}

const sectionForPath = (pathname: string): OperationsSummarySection | undefined => {
  if (pathname === '/products') return 'products';
  if (pathname === '/orders') return 'sales-orders';
  if (pathname === '/purchase-orders') return 'purchase-orders';
  return undefined;
};

export function AiAssistantDrawerContent({
  pathname,
  title,
  onNavigate,
}: AiAssistantDrawerContentProps) {
  const dashboard = useTranslations('dashboard');
  const purchaseOrders = useTranslations('purchaseOrders');
  const assistant = useTranslations('assistant');
  const nav = useTranslations('nav');
  const organization = useOrganization();
  const section = sectionForPath(pathname);
  const isDashboard = pathname === '/dashboard';
  const supportsPurchaseSuggestions = pathname === '/purchase-orders';
  const supportsSummary = isDashboard || Boolean(section);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryProvider, setSummaryProvider] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<OperationalSearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AiPurchaseSuggestionsResponse | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  useEffect(() => {
    if (!retryAfterSeconds) {
      return;
    }

    const timer = window.setInterval(() => {
      setRetryAfterSeconds((seconds) =>
        seconds && seconds > 1 ? seconds - 1 : null,
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  const generateSummary = async () => {
    const organizationId = organization.activeOrganization?.id;
    if (!organizationId || !supportsSummary) return;

    setIsGeneratingSummary(true);
    setSummaryError(null);
    try {
      const result = await aiService.generateOperationsSummary(organizationId, section);
      setSummary(result.text);
      setSummaryProvider(result.provider);
      setRetryAfterSeconds(null);
    } catch (error) {
      setRetryAfterSeconds(getRetryAfterSeconds(error) ?? null);
      setSummaryError(getErrorMessage(error, dashboard('aiSummaryError')));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const searchOperations = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const organizationId = organization.activeOrganization?.id;
    const trimmedQuery = query.trim();
    if (!organizationId || !trimmedQuery) {
      setSearchError(dashboard('operationalSearchEmpty'));
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      setSearchResult(await aiService.searchOperations(organizationId, trimmedQuery));
      setRetryAfterSeconds(null);
    } catch (error) {
      setRetryAfterSeconds(getRetryAfterSeconds(error) ?? null);
      setSearchError(getErrorMessage(error, dashboard('operationalSearchError')));
    } finally {
      setIsSearching(false);
    }
  };

  const generateSuggestions = async () => {
    const organizationId = organization.activeOrganization?.id;
    if (!organizationId) return;

    setIsGeneratingSuggestions(true);
    setSuggestionsError(null);
    try {
      setSuggestions(await aiService.generatePurchaseSuggestions(organizationId));
    } catch (error) {
      setSuggestionsError(getErrorMessage(error, purchaseOrders('suggestionsError')));
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const searchPresentation = useMemo(() => {
    if (!searchResult) return null;
    const presentations = {
      OUT_OF_STOCK_PRODUCTS: {
        title: dashboard('operationalSearchOutOfStockTitle'),
        empty: dashboard('operationalSearchOutOfStockEmpty'),
        href: '/products' as const,
        action: nav('products'),
      },
      PENDING_SALES_ORDERS: {
        title: dashboard('operationalSearchPendingOrdersTitle'),
        empty: dashboard('operationalSearchPendingOrdersEmpty'),
        href: '/orders' as const,
        action: nav('orders'),
      },
      OPEN_PURCHASE_ORDERS: {
        title: dashboard('operationalSearchOpenPurchasesTitle'),
        empty: dashboard('operationalSearchOpenPurchasesEmpty'),
        href: '/purchase-orders' as const,
        action: nav('purchaseOrders'),
      },
      UNSUPPORTED: {
        title: dashboard('operationalSearchUnsupportedTitle'),
        empty: dashboard('operationalSearchUnsupportedDescription'),
        href: null,
        action: null,
      },
    };
    return { ...presentations[searchResult.intent], ...searchResult };
  }, [dashboard, nav, searchResult]);

  if (!organization.activeOrganization) {
    return <Typography color="text.secondary">{assistant('noOrganization')}</Typography>;
  }

  return (
    <Stack spacing={2.5}>
      {retryAfterSeconds ? (
        <Alert severity="warning" aria-live="polite">
          {assistant('aiRateLimitNotice', { seconds: retryAfterSeconds })}
        </Alert>
      ) : null}
      {!supportsSummary ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF' }}>
          <Typography sx={{ fontWeight: 750 }}>{assistant('unavailableTitle')}</Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', lineHeight: 1.55 }}>
            {assistant('unavailableDescription')}
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF' }}>
          <Typography color="primary" sx={{ fontSize: '0.72rem', fontWeight: 750, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {isDashboard ? dashboard('aiSummaryEyebrow') : dashboard('aiSectionSummaryEyebrow')}
          </Typography>
          <Typography sx={{ mt: 0.5, fontWeight: 750 }}>
            {isDashboard ? dashboard('aiSummaryTitle') : dashboard('aiSectionSummaryTitle', { section: title })}
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.55 }}>
            {isDashboard ? dashboard('aiSummaryDescription') : dashboard('aiSectionSummaryDescription')}
          </Typography>
          {summary ? (
            <Box aria-live="polite" sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#F1F6F0', overflowWrap: 'anywhere' }}>
              <Typography color="primary" sx={{ fontSize: '0.68rem', fontWeight: 750, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {dashboard('aiResultLabel')}
              </Typography>
              <Typography sx={{ mt: 0.65, lineHeight: 1.6 }}>{summary}</Typography>
              {summaryProvider ? <Chip label={`${dashboard('aiGeneratedBy')}: ${summaryProvider}`} size="small" sx={{ mt: 1.25 }} /> : null}
            </Box>
          ) : null}
          {summaryError ? <Typography color="error" sx={{ mt: 1.25, fontSize: '0.88rem' }}>{summaryError}</Typography> : null}
          <Button fullWidth variant="contained" disabled={isGeneratingSummary || Boolean(retryAfterSeconds)} onClick={() => void generateSummary()} startIcon={isGeneratingSummary ? <CircularProgress color="inherit" size={16} /> : summary ? <RefreshRoundedIcon /> : <AutoAwesomeRoundedIcon />} sx={{ mt: 1.75 }}>
            {isGeneratingSummary ? dashboard('aiSummaryLoading') : summary ? dashboard('aiSummaryRefreshAction') : isDashboard ? dashboard('aiSummaryAction') : dashboard('aiSectionSummaryAction')}
          </Button>
        </Paper>
      )}

      {isDashboard ? (
        <Paper component="section" variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF' }}>
          <Typography color="primary" sx={{ fontSize: '0.72rem', fontWeight: 750, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dashboard('operationalSearchEyebrow')}</Typography>
          <Typography sx={{ mt: 0.5, fontWeight: 750 }}>{dashboard('operationalSearchTitle')}</Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.55 }}>{dashboard('operationalSearchDescription')}</Typography>
          <Box component="form" onSubmit={(event) => void searchOperations(event)} sx={{ mt: 1.5 }}>
            <Stack spacing={1}>
              <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder={dashboard('operationalSearchPlaceholder')} size="small" slotProps={{ htmlInput: { maxLength: 300 } }} />
              <Button type="submit" variant="outlined" disabled={isSearching || Boolean(retryAfterSeconds)} startIcon={isSearching ? <CircularProgress size={16} /> : <SearchRoundedIcon />}>{dashboard('operationalSearchAction')}</Button>
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
            {[dashboard('operationalSearchExampleStock'), dashboard('operationalSearchExampleOrders'), dashboard('operationalSearchExamplePurchases')].map((example) => <Chip key={example} label={example} onClick={() => setQuery(example)} size="small" />)}
          </Box>
          {searchPresentation ? (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #E0E9DE' }}>
              <Typography sx={{ fontWeight: 750 }}>{searchPresentation.title}</Typography>
              {searchPresentation.items.length ? <Stack spacing={0.75} sx={{ mt: 1 }}>{searchPresentation.items.map((item) => <Box key={item.id} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#F5F8F4', overflowWrap: 'anywhere' }}><Typography sx={{ fontSize: '0.87rem', fontWeight: 700 }}>{item.label}</Typography><Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>{item.detail}</Typography></Box>)}</Stack> : <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: '0.88rem' }}>{searchPresentation.empty}</Typography>}
              {searchPresentation.href ? <Button component={Link} href={searchPresentation.href} onClick={onNavigate} endIcon={<ArrowForwardRoundedIcon />} size="small" sx={{ mt: 0.75, px: 0 }}>{dashboard('operationalSearchOpenSection', { section: searchPresentation.action })}</Button> : null}
            </Box>
          ) : null}
          {searchError ? <Typography color="error" sx={{ mt: 1, fontSize: '0.88rem' }}>{searchError}</Typography> : null}
        </Paper>
      ) : null}

      {supportsPurchaseSuggestions ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF' }}>
          <Typography color="primary" sx={{ fontSize: '0.72rem', fontWeight: 750, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{assistant('purchaseSuggestionsEyebrow')}</Typography>
          <Typography sx={{ mt: 0.5, fontWeight: 750 }}>{purchaseOrders('suggestionsTitle')}</Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.55 }}>{purchaseOrders('suggestionsDescription')}</Typography>
          {suggestions ? <Stack spacing={1} sx={{ mt: 1.5 }}>{suggestions.suggestions.map((item) => {
            const hasOpenPurchaseOrders = item.openPurchaseOrders > 0;
            const action = item.recommendedAction === 'CREATE_PURCHASE_ORDER'
              ? { href: '/purchase-orders#create-purchase-order' as const, label: assistant('createPurchaseOrder') }
              : { href: '/purchase-orders#purchase-order-list' as const, label: assistant('reviewOpenPurchaseOrders') };

            return <Box key={item.productId} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F5F8F4', borderLeft: `3px solid ${item.priority === 'CRITICAL' ? '#C33C2E' : '#D1F09B'}` }}>
              <Typography sx={{ color: item.priority === 'CRITICAL' ? '#A32F25' : '#285C42', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{assistant(item.priority === 'CRITICAL' ? 'criticalPriority' : 'attentionPriority')}</Typography>
              <Typography sx={{ mt: 0.35, fontWeight: 750 }}>{item.productName}</Typography>
              {item.productSku ? <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: '0.78rem' }}>{assistant('productSku', { sku: item.productSku })}</Typography> : null}
              <Typography sx={{ mt: 0.6, color: 'text.secondary', fontSize: '0.82rem' }}>{assistant('currentStock', { stock: item.stock })}</Typography>
              <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: '0.82rem' }}>{hasOpenPurchaseOrders ? assistant('pendingReceiptQuantity', { count: item.openPurchaseOrders, quantity: item.pendingReceiptQuantity }) : assistant('noOpenPurchases')}</Typography>
              <Typography sx={{ mt: 0.75, color: item.priority === 'CRITICAL' ? '#A32F25' : '#285C42', fontSize: '0.82rem', lineHeight: 1.45 }}>{assistant(hasOpenPurchaseOrders ? 'openPurchaseOrderAction' : item.priority === 'CRITICAL' ? 'outOfStockAction' : 'lowStockAction')}</Typography>
              <Button component={Link} href={action.href} onClick={onNavigate} endIcon={<ArrowForwardRoundedIcon />} size="small" sx={{ mt: 0.75, px: 0 }}>{action.label}</Button>
            </Box>;
          })}</Stack> : null}
          {suggestionsError ? <Typography color="error" sx={{ mt: 1.25, fontSize: '0.88rem' }}>{suggestionsError}</Typography> : null}
          <Button fullWidth variant="outlined" disabled={isGeneratingSuggestions} onClick={() => void generateSuggestions()} startIcon={isGeneratingSuggestions ? <CircularProgress size={16} /> : <RefreshRoundedIcon />} sx={{ mt: 1.75 }}>{purchaseOrders('suggestionsAction')}</Button>
        </Paper>
      ) : null}

      <Divider />
      <Typography color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.45 }}>{dashboard('aiPrivacyNotice')}</Typography>
    </Stack>
  );
}
