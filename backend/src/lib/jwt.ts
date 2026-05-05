import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_EXPIRY = '1h';
const LONG_LIVED_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

function getJwtSecret(): string {
  return process.env.JWT_SECRET!;
}

export type AccessTokenPayload = {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
};

export type RefreshTokenPayload = {
  userId: string;
  tenantId: string;
  tokenId: string;
};

export const generateAccessToken = (payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateLongLivedToken = (payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: LONG_LIVED_TOKEN_EXPIRY });
};

export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: REFRESH_TOKEN_EXPIRY });
};

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

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, getJwtSecret()) as RefreshTokenPayload;
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
