import { Hono } from 'hono';
import { eq, and, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { roles, userRoles } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import { createRoleSchema, updateRoleSchema } from '../types';

const rolesRouter = new Hono();

rolesRouter.use('/*', tenantMiddleware);

const AVAILABLE_PERMISSIONS = [
  { resource: 'USER', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'ROLE', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'PATIENT', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'APPOINTMENT', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
  { resource: 'WARD', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
];

rolesRouter.get('/permissions', requirePermission('ROLE', 'READ'), async (c) => {
  return c.json({ permissions: AVAILABLE_PERMISSIONS });
});

rolesRouter.get('/', requirePermission('ROLE', 'READ'), async (c) => {
  try {
    const tenantId = c.get('tenantId');

    const allRoles = await db.query.roles.findMany({
      where: or(
        eq(roles.isSystemRole, true),
        eq(roles.tenantId, tenantId)
      ),
      orderBy: (roles, { desc }) => [desc(roles.hierarchyLevel)],
    });

    const rolesWithUserCount = await Promise.all(
      allRoles.map(async (role) => {
        const userCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(userRoles)
          .where(eq(userRoles.roleId, role.id));

        return {
          ...role,
          userCount: Number(userCount[0]?.count || 0),
        };
      })
    );

    return c.json({ roles: rolesWithUserCount });
  } catch (error) {
    return c.json({ error: 'Failed to fetch roles' }, 500);
  }
});

rolesRouter.get('/:id', requirePermission('ROLE', 'READ'), async (c) => {
  try {
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
  } catch (error) {
    return c.json({ error: 'Failed to fetch role' }, 500);
  }
});

rolesRouter.post('/', requirePermission('ROLE', 'CREATE'), async (c) => {
  try {
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

    if (validatedData.hierarchyLevel >= 80) {
      return c.json({ error: 'Custom roles cannot have hierarchy level 80 or above' }, 400);
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
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Failed to create role' }, 500);
  }
});

rolesRouter.put('/:id', requirePermission('ROLE', 'UPDATE'), async (c) => {
  try {
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

    if (validatedData.hierarchyLevel && validatedData.hierarchyLevel >= 80) {
      return c.json({ error: 'Custom roles cannot have hierarchy level 80 or above' }, 400);
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
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json({ error: 'Invalid input data' }, 400);
    }
    return c.json({ error: 'Failed to update role' }, 500);
  }
});

rolesRouter.delete('/:id', requirePermission('ROLE', 'DELETE'), async (c) => {
  try {
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
  } catch (error) {
    return c.json({ error: 'Failed to delete role' }, 500);
  }
});

export default rolesRouter;
