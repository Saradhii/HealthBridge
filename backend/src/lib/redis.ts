import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

function initRedis(): Redis {
  if (!redisInstance) {
    const redisUrl = process.env.REDIS_URL!;
    const token = redisUrl.split('default:')[1].split('@')[0];
    const host = redisUrl.split('@')[1];
    const url = `https://${host.replace(':6379', '')}`;
    redisInstance = new Redis({ url, token });
  }
  return redisInstance;
}

export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    const instance = initRedis();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export const getTenantRedisKey = (tenantId: string, key: string): string => {
  return `tenant:${tenantId}:${key}`;
};

export const setTenantData = async <T>(
  tenantId: string,
  key: string,
  value: T,
  expirySeconds?: number
): Promise<void> => {
  const fullKey = getTenantRedisKey(tenantId, key);
  if (expirySeconds) {
    await redis.setex(fullKey, expirySeconds, JSON.stringify(value));
  } else {
    await redis.set(fullKey, JSON.stringify(value));
  }
};

export const getTenantData = async <T>(
  tenantId: string,
  key: string
): Promise<T | null> => {
  const fullKey = getTenantRedisKey(tenantId, key);
  const data = await redis.get(fullKey);
  return data ? (data as T) : null;
};

export const deleteTenantData = async (
  tenantId: string,
  key: string
): Promise<void> => {
  const fullKey = getTenantRedisKey(tenantId, key);
  await redis.del(fullKey);
};

export const getTenantKeys = async (tenantId: string, pattern: string): Promise<string[]> => {
  const fullPattern = getTenantRedisKey(tenantId, pattern);
  return await redis.keys(fullPattern);
};

// ===== Login rate limiting =====

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_SECONDS = 15 * 60;

const loginAttemptKey = (email: string, ip: string): string =>
  `login-attempts:${email.toLowerCase()}:${ip}`;

// Returns true if the email+IP pair has exceeded the allowed login attempts.
// Fails OPEN (returns false) if Redis is unavailable so logins are never blocked
// by an infrastructure outage.
export const isLoginRateLimited = async (email: string, ip: string): Promise<boolean> => {
  try {
    const attempts = await redis.get<number>(loginAttemptKey(email, ip));
    return attempts !== null && Number(attempts) >= LOGIN_MAX_ATTEMPTS;
  } catch (err) {
    console.error('Login rate-limit check failed, allowing request:', err);
    return false;
  }
};

// Records a failed login attempt within a fixed window. Best-effort: Redis errors
// are swallowed so authentication keeps working.
export const recordFailedLogin = async (email: string, ip: string): Promise<void> => {
  try {
    const key = loginAttemptKey(email, ip);
    const attempts = await redis.incr(key);
    if (attempts === 1) {
      await redis.expire(key, LOGIN_WINDOW_SECONDS);
    }
  } catch (err) {
    console.error('Failed to record login attempt:', err);
  }
};
