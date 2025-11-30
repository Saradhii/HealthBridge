/**
 * JWT utility functions for client-side token handling
 * Note: These functions decode tokens but DO NOT verify signatures
 * Token verification happens on the backend
 */

export interface DecodedToken {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Decode a JWT token without verification
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    return decoded as DecodedToken;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token string or decoded token
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string | DecodedToken): boolean {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;

    if (!decoded || !decoded.exp) {
      return true;
    }

    // Check if token is expired (with 30 second buffer for clock skew)
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const buffer = 30 * 1000; // 30 seconds

    return currentTime >= (expirationTime - buffer);
  } catch (error) {
    console.error('Failed to check token expiry:', error);
    return true;
  }
}

/**
 * Get the time remaining until token expires
 * @param token - JWT token string or decoded token
 * @returns milliseconds until expiry, or 0 if expired
 */
export function getTokenExpiryTime(token: string | DecodedToken): number {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;

    if (!decoded || !decoded.exp) {
      return 0;
    }

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeRemaining = expirationTime - currentTime;

    return timeRemaining > 0 ? timeRemaining : 0;
  } catch (error) {
    console.error('Failed to get token expiry time:', error);
    return 0;
  }
}

/**
 * Check if token will expire soon (within specified minutes)
 * @param token - JWT token string or decoded token
 * @param minutesThreshold - Number of minutes to check (default: 5)
 * @returns true if token expires within threshold
 */
export function willTokenExpireSoon(
  token: string | DecodedToken,
  minutesThreshold: number = 5
): boolean {
  const timeRemaining = getTokenExpiryTime(token);
  const threshold = minutesThreshold * 60 * 1000; // Convert to milliseconds

  return timeRemaining > 0 && timeRemaining <= threshold;
}

/**
 * Validate token structure and basic claims
 * @param token - JWT token string
 * @returns true if token structure is valid
 */
export function isValidTokenStructure(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const decoded = decodeToken(token);

  if (!decoded) {
    return false;
  }

  // Check required fields
  return Boolean(
    decoded.userId &&
    decoded.tenantId &&
    decoded.exp &&
    decoded.iat &&
    Array.isArray(decoded.roles) &&
    Array.isArray(decoded.permissions)
  );
}
