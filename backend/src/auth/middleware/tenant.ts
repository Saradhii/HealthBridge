import { Context, Next } from 'hono';
import { verifyAccessToken } from '../../lib/jwt';
import type { AppContext } from '../types';

export const tenantMiddleware = async (c: Context<AppContext>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'No authorization token provided' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('userId', decoded.userId);
  c.set('tenantId', decoded.tenantId);
  c.set('roles', decoded.roles);
  c.set('permissions', decoded.permissions);

  await next();
};


export const getTenantContext = (c: Context) => {
  return {
    userId: c.get('userId') as string,
    tenantId: c.get('tenantId') as string,
    roles: c.get('roles') as string[],
    permissions: c.get('permissions') as string[],
  };
};
