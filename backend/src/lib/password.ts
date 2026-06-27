import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from './constants';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate a cryptographically secure temporary password using the Web Crypto
// CSPRNG. Excludes visually ambiguous characters (0/O, 1/l/I).
export const generateTempPassword = (length = 12): string => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
};
