import { Hono } from 'hono';
import { eq, and, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { roles, userRoles } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import type { AppContext } from '../auth/types';
import { createRoleSchema, updateRoleSchema } from '../types';
import { ROLE_HIERARCHY_MAX } from '../lib/constants';

const rolesRouter = new Hono<AppContext>();

rolesRouter.use('/*', tenantMiddleware);

const AVAILABLE_PERMISSIONS = [
  { resource: 'USER', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'ROLE', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'PATIENT', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'APPOINTMENT', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'WARD', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'PRESCRIPTION', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'LAB_RESULT', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'PROCEDURE', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
];

rolesRouter.get('/permissions', requirePermission('ROLE', 'READ'), async (c) => {
  return c.json({ permissions: AVAILABLE_PERMISSIONS });
});

rolesRouter.get('/', requirePermission('ROLE', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');

  const allRoles = await db.query.roles.findMany({
    where: or(
      eq(roles.isSystemRole, true),
      eq(roles.tenantId, tenantId)
    ),
    orderBy: (roles, { desc }) => [desc(roles.hierarchyLevel)],
  });

  // Single grouped count instead of one query per role.
  const counts = await db
    .select({ roleId: userRoles.roleId, count: sql<number>`count(*)` })
    .from(userRoles)
    .groupBy(userRoles.roleId);

  const countByRole = new Map(counts.map((r) => [r.roleId, Number(r.count)]));

  const rolesWithUserCount = allRoles.map((role) => ({
    ...role,
    userCount: countByRole.get(role.id) ?? 0,
  }));

  return c.json({ roles: rolesWithUserCount });
});

rolesRouter.get('/:id', requirePermission('ROLE', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');
  const roleId = c.req.param('id');

  const role = await db.query.roles.findFirst({
    where: and(
      eq(roles.id, roleId),
      or(
        eq(roles.isSystemRole, true),
        eq(roles.tenantId, tenantId)
      )
    ),
  });

  if (!role) {
    return c.json({ error: 'Role not found' }, 404);
  }

  const userCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(userRoles)
    .where(eq(userRoles.roleId, role.id));

  const usersWithRole = await db.query.userRoles.findMany({
    where: eq(userRoles.roleId, role.id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    limit: 10,
  });

  return c.json({
    role: {
      ...role,
      userCount: Number(userCount[0]?.count || 0),
      users: usersWithRole.map((ur) => ur.user),
    },
  });
});

rolesRouter.post('/', requirePermission('ROLE', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const validatedData = createRoleSchema.parse(body);

  const existingRole = await db.query.roles.findFirst({
    where: and(
      eq(roles.slug, validatedData.slug),
      or(
        eq(roles.tenantId, tenantId),
        eq(roles.isSystemRole, true)
      )
    ),
  });

  if (existingRole) {
    return c.json({ error: 'Role slug already exists' }, 400);
  }

  if (validatedData.hierarchyLevel >= ROLE_HIERARCHY_MAX) {
    return c.json({ error: `Custom roles cannot have hierarchy level ${ROLE_HIERARCHY_MAX} or above` }, 400);
  }

  const [newRole] = await db
    .insert(roles)
    .values({
      tenantId,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description,
      permissions: validatedData.permissions,
      hierarchyLevel: validatedData.hierarchyLevel,
      isSystemRole: false,
    })
    .returning();

  return c.json({ role: newRole }, 201);
});

rolesRouter.put('/:id', requirePermission('ROLE', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const roleId = c.req.param('id');
  const body = await c.req.json();
  const validatedData = updateRoleSchema.parse(body);

  const role = await db.query.roles.findFirst({
    where: and(
      eq(roles.id, roleId),
      eq(roles.tenantId, tenantId)
    ),
  });

  if (!role) {
    return c.json({ error: 'Role not found' }, 404);
  }

  if (role.isSystemRole) {
    return c.json({ error: 'Cannot edit system roles' }, 403);
  }

  if (validatedData.hierarchyLevel && validatedData.hierarchyLevel >= ROLE_HIERARCHY_MAX) {
    return c.json({ error: `Custom roles cannot have hierarchy level ${ROLE_HIERARCHY_MAX} or above` }, 400);
  }

  const [updatedRole] = await db
    .update(roles)
    .set({
      name: validatedData.name,
      description: validatedData.description,
      permissions: validatedData.permissions,
      hierarchyLevel: validatedData.hierarchyLevel,
    })
    .where(eq(roles.id, roleId))
    .returning();

  return c.json({ role: updatedRole });
});

rolesRouter.delete('/:id', requirePermission('ROLE', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const roleId = c.req.param('id');

  const role = await db.query.roles.findFirst({
    where: and(
      eq(roles.id, roleId),
      eq(roles.tenantId, tenantId)
    ),
  });

  if (!role) {
    return c.json({ error: 'Role not found' }, 404);
  }

  if (role.isSystemRole) {
    return c.json({ error: 'Cannot delete system roles' }, 403);
  }

  const usersWithRole = await db.query.userRoles.findFirst({
    where: eq(userRoles.roleId, roleId),
  });

  if (usersWithRole) {
    return c.json({ error: 'Cannot delete role with assigned users' }, 400);
  }

  await db.delete(roles).where(eq(roles.id, roleId));

  return c.json({ message: 'Role deleted successfully' });
});

export default rolesRouter;
