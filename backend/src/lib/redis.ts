import { Redis } from '@upstash/redis';

const redisUrl = process.env.REDIS_URL!;
const token = redisUrl.split('default:')[1].split('@')[0];
const host = redisUrl.split('@')[1];
const url = `https://${host.replace(':6379', '')}`;

export const redis = new Redis({ url, token });

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
