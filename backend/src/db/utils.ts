import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { eq, and, count } from 'drizzle-orm';

// HTTP (fetch-based) driver — chosen deliberately for Cloudflare Workers.
//
// The previous neon-serverless `Pool` keeps a long-lived WebSocket. On Workers
// each request runs in its own I/O context, and a socket opened by one request
// cannot be used by another ("Cannot perform I/O on behalf of a different
// request"). Caching that pool across requests caused intermittent 500s under
// the burst of concurrent calls that client-side navigation fires — while a
// full page refresh (a fresh context) happened to work.
//
// neon-http is stateless: every query is an independent fetch, so a single
// instance is safe to share across requests and concurrency. Interactive
// transactions aren't supported by this driver; use db.batch([...]) instead.
function createDb() {
  return drizzle(neon(process.env.DATABASE_URL!), { schema });
}

type DbType = ReturnType<typeof createDb>;

let dbInstance: DbType | null = null;

function initDb(): DbType {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

export const db = new Proxy({} as unknown as DbType, {
  get(_, prop) {
    const instance = initDb();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
}) as unknown as DbType;

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

// Retained for callers (e.g. seed scripts) that close out after running.
// The HTTP driver holds no persistent connection, so there is nothing to tear
// down — this is intentionally a no-op.
export async function closeDbConnection() {
  dbInstance = null;
}

