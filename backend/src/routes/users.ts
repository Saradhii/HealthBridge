import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { users, userRoles, roles } from '../db/schema';
import { tenantMiddleware, requirePermission } from '../auth';
import type { AppContext } from '../auth/types';
import { hashPassword, generateTempPassword } from '../lib/password';
import { getPaginationParams, buildPagination } from '../lib/pagination';
import { serializeUser } from '../lib/serialize';

const usersRouter = new Hono<AppContext>();

usersRouter.use('/*', tenantMiddleware);

// GET /api/users - Get all users with pagination, search, and filters
usersRouter.get('/', requirePermission('USER', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');

  const params = getPaginationParams(c);
  const search = c.req.query('search') || '';
  const isActiveFilter = c.req.query('isActive');
  const roleSlug = c.req.query('roleSlug');

  // Build base conditions
  const baseConditions = [eq(users.tenantId, tenantId)];

  if (search) {
    baseConditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )!
    );
  }

  if (isActiveFilter !== undefined) {
    baseConditions.push(eq(users.isActive, isActiveFilter === 'true'));
  }

  let usersList: any[];
  let total: number;

  if (roleSlug) {
    // When role filtering is applied, join with userRoles and roles tables
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        department: users.department,
        specialization: users.specialization,
        shift: users.shift,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        forcePasswordChange: users.forcePasswordChange,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        tenantId: users.tenantId,
        role: {
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
        },
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(roles.slug, roleSlug),
        ...baseConditions
      ))
      .orderBy(desc(users.createdAt))
      .limit(params.limit + 1)
      .offset(params.offset);

    // Reshape so each row matches the `userRoles` relation format
    usersList = rows.map((user) => ({
      ...user,
      userRoles: [{ role: user.role }],
    }));

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(roles.slug, roleSlug),
        ...baseConditions
      ));

    total = Number(countResult[0]?.count || 0);
  } else {
    // Normal query without role filter
    usersList = await db.query.users.findMany({
      where: and(...baseConditions),
      with: {
        userRoles: {
          with: {
            role: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: [desc(users.createdAt)],
      limit: params.limit + 1,
      offset: params.offset,
      columns: {
        password: false,
      },
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...baseConditions));

    total = Number(countResult[0]?.count || 0);
  }

  const { data, pagination } = buildPagination(usersList, total, params);

  return c.json({
    users: data.map(serializeUser),
    pagination,
  });
});

// GET /api/users/me - Get current user details
usersRouter.get('/me', async (c) => {
  const userId = c.get('userId');
  const tenantId = c.get('tenantId');

  const user = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.tenantId, tenantId)
    ),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
    columns: {
      password: false,
    },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user: serializeUser(user) });
});

// GET /api/users/:id - Get single user details
usersRouter.get('/:id', requirePermission('USER', 'READ'), async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('id');

  const user = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.tenantId, tenantId)
    ),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
    columns: {
      password: false,
    },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user: serializeUser(user) });
});

// POST /api/users - Create new user
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  department: z.string().nullable(),
  specialization: z.string().nullable(),
  shift: z.string().nullable(),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(true),
  forcePasswordChange: z.boolean().default(false),
  roleIds: z.array(z.string()).min(1),
});

usersRouter.post('/', requirePermission('USER', 'CREATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const data = createUserSchema.parse(body);

  // Check if email already exists in the tenant
  const existingUser = await db.query.users.findFirst({
    where: and(
      eq(users.email, data.email),
      eq(users.tenantId, tenantId)
    ),
  });

  if (existingUser) {
    return c.json({ error: 'Email already exists in this hospital' }, 400);
  }

  // Generate a temporary password with a CSPRNG. The new user must change it on
  // first login.
  // TODO: deliver via email once a provider is configured; stop returning in response body
  const tempPassword = generateTempPassword();
  const hashedPassword = await hashPassword(tempPassword);

  // Create user with roles
  const newUser = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        tenantId,
        email: data.email,
        password: hashedPassword,
        name: data.name,
        department: data.department,
        specialization: data.specialization,
        shift: data.shift,
        isActive: data.isActive,
        emailVerified: data.emailVerified,
        // Force a password change since the account is created with a temp password.
        forcePasswordChange: true,
      })
      .returning();

    const roleAssignments = data.roleIds.map((roleId) => ({
      userId: user.id,
      roleId,
    }));

    await tx.insert(userRoles).values(roleAssignments);

    return user;
  });

  // Get the complete user with roles for response
  const createdUser = await db.query.users.findFirst({
    where: eq(users.id, newUser.id),
    with: {
      userRoles: {
        with: {
          role: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    columns: {
      password: false,
    },
  });

  return c.json({
    user: serializeUser(createdUser!),
    tempPassword, // Only return on creation
  });
});

// PUT /api/users/:id - Update user
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  shift: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  forcePasswordChange: z.boolean().optional(),
});

usersRouter.put('/:id', requirePermission('USER', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('id');
  const body = await c.req.json();
  const data = updateUserSchema.parse(body);

  // Check if user exists and belongs to tenant
  const existingUser = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.tenantId, tenantId)
    ),
  });

  if (!existingUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Update user
  await db
    .update(users)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.specialization !== undefined && { specialization: data.specialization }),
      ...(data.shift !== undefined && { shift: data.shift }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
      ...(data.forcePasswordChange !== undefined && { forcePasswordChange: data.forcePasswordChange }),
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
    .returning();

  // Get the complete user with roles for response
  const userWithRoles = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      userRoles: {
        with: {
          role: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    columns: {
      password: false,
    },
  });

  return c.json({ user: serializeUser(userWithRoles!) });
});

// PUT /api/users/:id/roles - Update user roles
const updateRolesSchema = z.object({
  roleIds: z.array(z.string()).min(1),
});

usersRouter.put('/:id/roles', requirePermission('USER', 'UPDATE'), async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('id');
  const body = await c.req.json();
  const { roleIds } = updateRolesSchema.parse(body);

  // Check if user exists and belongs to tenant
  const existingUser = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.tenantId, tenantId)
    ),
  });

  if (!existingUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Update user roles in a transaction
  await db.transaction(async (tx) => {
    await tx
      .delete(userRoles)
      .where(eq(userRoles.userId, userId));

    await tx.insert(userRoles).values(
      roleIds.map((roleId) => ({
        userId,
        roleId,
      }))
    );
  });

  // Get the complete user with roles for response
  const userWithRoles = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      userRoles: {
        with: {
          role: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    columns: {
      password: false,
    },
  });

  return c.json({ user: serializeUser(userWithRoles!) });
});

// DELETE /api/users/:id - Delete user
usersRouter.delete('/:id', requirePermission('USER', 'DELETE'), async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('id');

  // Check if user exists and belongs to tenant
  const existingUser = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.tenantId, tenantId)
    ),
  });

  if (!existingUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Delete user (cascade delete will handle userRoles)
  await db
    .delete(users)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)));

  return c.json({ message: 'User deleted successfully' });
});

export default usersRouter;
