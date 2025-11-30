import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';
import { eq, and, count } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });

// Database utility functions
export async function getTenantById(tenantId: string) {
  return await db.query.tenants.findFirst({
    where: eq(schema.tenants.id, tenantId),
  });
}

export async function getTenantBySlug(slug: string) {
  return await db.query.tenants.findFirst({
    where: eq(schema.tenants.slug, slug),
  });
}

export async function getUserByEmail(email: string, tenantId?: string) {
  const whereConditions = [eq(schema.users.email, email)];

  if (tenantId) {
    whereConditions.push(eq(schema.users.tenantId, tenantId));
  }

  return await db.query.users.findFirst({
    where: and(...whereConditions),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
      tenant: tenantId ? undefined : true,
    },
  });
}

export async function getUserRoles(userId: string) {
  const userRoles = await db.query.userRoles.findMany({
    where: eq(schema.userRoles.userId, userId),
    with: {
      role: true,
    },
  });

  return userRoles.map(ur => ur.role);
}

export async function getRoleBySlug(slug: string) {
  return await db.query.roles.findFirst({
    where: eq(schema.roles.slug, slug),
  });
}

export async function countPatientsInTenant(tenantId: string) {
  const result = await db
    .select({ count: count() })
    .from(schema.patients)
    .where(eq(schema.patients.tenantId, tenantId))
    .execute();

  return result[0]?.count || 0;
}

export async function countUsersInTenant(tenantId: string) {
  const result = await db
    .select({ count: count() })
    .from(schema.users)
    .where(eq(schema.users.tenantId, tenantId))
    .execute();

  return result[0]?.count || 0;
}

export async function closeDbConnection() {
  await pool.end();
}

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return await db.transaction(callback);
}

