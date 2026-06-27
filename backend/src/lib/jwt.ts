import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_EXPIRY = '1h';
const LONG_LIVED_TOKEN_EXPIRY = '24h';

// Minimum acceptable JWT signing secret length (256 bits as hex/ascii).
const MIN_JWT_SECRET_LENGTH = 32;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET is missing or too short; it must be at least ${MIN_JWT_SECRET_LENGTH} characters`
    );
  }
  return secret;
}

export type AccessTokenPayload = {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
};

export const generateAccessToken = (payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateLongLivedToken = (payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: LONG_LIVED_TOKEN_EXPIRY });
};

// Refresh tokens are opaque random strings persisted in the database. The JWT
// variant was intentionally dropped to avoid two competing refresh mechanisms.
export const generateRefreshTokenString = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): jwt.JwtPayload | null => {
  try {
    return jwt.decode(token) as jwt.JwtPayload;
  } catch {
    return null;
  }
};
