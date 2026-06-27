// Shared magic-number constants used across the backend.

// Refresh tokens are valid for 7 days.
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Password reset tokens are valid for 1 hour.
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// bcrypt cost factor used for password hashing.
export const BCRYPT_SALT_ROUNDS = 10;

// System roles at or above this hierarchy level are reserved; custom roles must be below it.
export const ROLE_HIERARCHY_MAX = 80;
