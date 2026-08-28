'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { organizationsService } from '@/services/organizations.service';
import type { CreateOrganizationRequest, OrganizationResponse } from '@/types/api';
import { getErrorMessage } from '@/lib/api-error';
import { useAuth } from './auth.context';

interface OrganizationContextValue {
  organizations: OrganizationResponse[];
  activeOrganization: OrganizationResponse | null;
  activeOrganizationId: string | null;
  isLoading: boolean;
  error: string | null;
  createOrganization: (data: CreateOrganizationRequest) => Promise<OrganizationResponse>;
  refreshOrganizations: () => Promise<void>;
  setActiveOrganizationId: (organizationId: string) => void;
}

const ACTIVE_ORGANIZATION_KEY = 'active_organization_id';
const OrganizationContext = createContext<OrganizationContextValue | null>(null);

function resolveActiveOrganization(
  organizations: OrganizationResponse[],
  preferredOrganizationId: string | null,
): OrganizationResponse | null {
  if (organizations.length === 0) {
    return null;
  }

  return (
    organizations.find((organization) => organization.id === preferredOrganizationId) ??
    organizations[0]
  );
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async (preferredOrganizationId?: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await organizationsService.list();
      const storedOrganizationId =
        preferredOrganizationId ??
        (typeof window === 'undefined' ? null : localStorage.getItem(ACTIVE_ORGANIZATION_KEY));
      const nextActiveOrganization = resolveActiveOrganization(data, storedOrganizationId);

      setOrganizations(data);
      setActiveOrganizationIdState(nextActiveOrganization?.id ?? null);

      if (typeof window !== 'undefined') {
        if (nextActiveOrganization) {
          localStorage.setItem(ACTIVE_ORGANIZATION_KEY, nextActiveOrganization.id);
        } else {
          localStorage.removeItem(ACTIVE_ORGANIZATION_KEY);
        }
      }
    } catch (loadError) {
      setOrganizations([]);
      setActiveOrganizationIdState(null);
      setError(getErrorMessage(loadError, 'Organizations could not be loaded.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    if (!auth.isAuthenticated) {
      setOrganizations([]);
      setActiveOrganizationIdState(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    void loadOrganizations();
  }, [auth.isAuthenticated, auth.isLoading, loadOrganizations]);

  const createOrganization = useCallback(
    async (data: CreateOrganizationRequest) => {
      const organization = await organizationsService.create(data);
      const nextOrganizations = [...organizations, organization];

      setOrganizations(nextOrganizations);
      setActiveOrganizationIdState(organization.id);
      setError(null);

      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_ORGANIZATION_KEY, organization.id);
      }

      return organization;
    },
    [organizations],
  );

  const refreshOrganizations = useCallback(async () => {
    await loadOrganizations(activeOrganizationId);
  }, [activeOrganizationId, loadOrganizations]);

  const setActiveOrganizationId = useCallback(
    (organizationId: string) => {
      if (!organizations.some((organization) => organization.id === organizationId)) {
        return;
      }

      setActiveOrganizationIdState(organizationId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_ORGANIZATION_KEY, organizationId);
      }
    },
    [organizations],
  );

  const activeOrganization = useMemo(
    () =>
      organizations.find((organization) => organization.id === activeOrganizationId) ?? null,
    [activeOrganizationId, organizations],
  );

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        activeOrganizationId,
        isLoading,
        error,
        createOrganization,
        refreshOrganizations,
        setActiveOrganizationId,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }

  return context;
}
