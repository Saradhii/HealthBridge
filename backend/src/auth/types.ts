
export interface JWTPayload {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}

export interface AuthContext {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}

// Define types for Hono context variables
export interface AppContext {
  Variables: {
    userId: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
  };
}