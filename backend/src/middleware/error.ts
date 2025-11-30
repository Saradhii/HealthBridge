import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = (error: Error, c: Context) => {
  // Handle HTTP exceptions (like validation errors)
  if (error instanceof HTTPException) {
    return c.json(
      { error: error.message },
      error.status
    );
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return c.json(
      { error: 'Invalid input data' },
      400
    );
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return c.json(
      { error: 'Invalid token' },
      401
    );
  }

  if (error.name === 'TokenExpiredError') {
    return c.json(
      { error: 'Token expired' },
      401
    );
  }

  // Handle database errors
  if (error.message.includes('duplicate key')) {
    return c.json(
      { error: 'Resource already exists' },
      409
    );
  }

  if (error.message.includes('foreign key constraint')) {
    return c.json(
      { error: 'Invalid reference' },
      400
    );
  }

  // Generic server error
  console.error('Unhandled error:', error);
  return c.json(
    { error: 'Internal server error' },
    500
  );
};

// Wrapper for async route handlers to catch errors
export const asyncHandler = (fn: (c: Context) => Promise<Response>) => {
  return (c: Context) => {
    return Promise.resolve(fn(c)).catch(error => {
      return errorHandler(error, c);
    });
  };
};