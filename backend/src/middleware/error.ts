import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

// Global error handler. Maps known error types to safe responses and falls back
// to a generic message for everything else. Raw error objects are never returned
// to the client; unexpected errors are logged server-side instead.
export const errorHandler = (error: Error, c: Context) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }

  // Validation errors are surfaced with field-level details but no internals.
  if (error instanceof ZodError) {
    return c.json({ error: 'Invalid input data', details: error.errors }, 400);
  }

  if (error.name === 'JsonWebTokenError') {
    return c.json({ error: 'Invalid token' }, 401);
  }

  if (error.name === 'TokenExpiredError') {
    return c.json({ error: 'Token expired' }, 401);
  }

  if (error.message.includes('duplicate key')) {
    return c.json({ error: 'Resource already exists' }, 409);
  }

  if (error.message.includes('foreign key constraint')) {
    return c.json({ error: 'Invalid reference' }, 400);
  }

  console.error('Unhandled error:', error);
  return c.json({ error: 'Internal server error' }, 500);
};

// Global 404 handler for unmatched routes.
export const notFoundHandler = (c: Context) => {
  return c.json({ error: 'Not found' }, 404);
};
