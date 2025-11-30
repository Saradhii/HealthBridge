import { db } from '../db';
import { userRoles } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const userRoleRecords = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, userId),
    with: {
      role: true,
    },
  });

  const allPermissions = new Set<string>();

  for (const userRole of userRoleRecords) {
    const rolePermissions = userRole.role.permissions as string[];
    rolePermissions.forEach(permission => allPermissions.add(permission));
  }

  return Array.from(allPermissions);
};

export const hasPermission = (userPermissions: string[], resource: string, action: string): boolean => {
  const requiredPermission = `${resource}:${action}`;

  if (userPermissions.includes('*:*')) {
    return true;
  }

  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
};

export const hasAnyPermission = (userPermissions: string[], permissions: string[]): boolean => {
  if (userPermissions.includes('*:*')) {
    return true;
  }

  return permissions.some(permission => {
    const [resource, action] = permission.split(':');
    return hasPermission(userPermissions, resource, action);
  });
};
