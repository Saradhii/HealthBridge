import { Context, Next } from 'hono';
import { hasPermission, hasAnyPermission } from '../permissions';
import type { AppContext } from '../types';

export const requirePermission = (resource: string, action: string) => {
  return async (c: Context<AppContext>, next: Next) => {
    const permissions = c.get('permissions') as string[];

    if (!permissions) {
      return c.json({ error: 'No permissions found' }, 403);
    }

    if (!hasPermission(permissions, resource, action)) {
      return c.json({ error: `Insufficient permissions. Required: ${resource}:${action}` }, 403);
    }

    return await next();
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return async (c: Context<AppContext>, next: Next) => {
    const userPermissions = c.get('permissions') as string[];

    if (!userPermissions) {
      return c.json({ error: 'No permissions found' }, 403);
    }

    if (!hasAnyPermission(userPermissions, permissions)) {
      return c.json({ error: `Insufficient permissions. Required one of: ${permissions.join(', ')}` }, 403);
    }

    return await next();
  };
};

// Predefined permission groups for common use cases
export const requireAuth = () => {
  return async (c: Context<AppContext>, next: Next) => {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    return await next();
  };
};

export const requireAdmin = () => {
  return requireAnyPermission(['*:*']);
};