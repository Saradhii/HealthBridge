import { Context } from 'hono';
import type { AppContext } from '../auth/types';

// Helper to get typed context values
export const getContextTenantId = (c: Context<AppContext>): string => {
  return c.get('tenantId') as string;
};

export const getContextUserId = (c: Context<AppContext>): string => {
  return c.get('userId') as string;
};

export const getContextRoles = (c: Context<AppContext>): string[] => {
  return c.get('roles') as string[];
};

export const getContextPermissions = (c: Context<AppContext>): string[] => {
  return c.get('permissions') as string[];
};