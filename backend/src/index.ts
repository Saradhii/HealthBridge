import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import rolesRouter from './routes/roles';
import usersRouter from './routes/users';
import patientsRouter from './routes/patients';
import appointmentsRouter from './routes/appointments';
import wardsRouter from './routes/wards';
import prescriptionsRouter from './routes/prescriptions';
import labResultsRouter from './routes/labResults';
import proceduresRouter from './routes/procedures';
import dashboardRouter from './routes/dashboard';
import { errorHandler, notFoundHandler } from './middleware/error';

type Bindings = {
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS restricted to the configured frontend origin (plus localhost for dev).
// Bindings are per-request on Workers, so the allow-list is built inside the
// middleware from c.env.
app.use('/*', (c, next) => {
  const allowedOrigins = [c.env.FRONTEND_URL, 'http://localhost:3000'].filter(
    (origin): origin is string => Boolean(origin)
  );
  return cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })(c, next);
});

app.use('/*', async (c, next) => {
  const bindings: Record<string, string | undefined> = {
    DATABASE_URL: c.env.DATABASE_URL,
    REDIS_URL: c.env.REDIS_URL,
    JWT_SECRET: c.env.JWT_SECRET,
    FRONTEND_URL: c.env.FRONTEND_URL,
  };
  for (const [key, value] of Object.entries(bindings)) {
    if (value && !process.env[key]) {
      process.env[key] = value;
    }
  }
  await next();
});

app.get('/', (c) => {
  return c.json({ message: 'HealthBridge API' });
});

app.route('/api/auth', auth);
app.route('/api/roles', rolesRouter);
app.route('/api/users', usersRouter);
app.route('/api/patients', patientsRouter);
app.route('/api/appointments', appointmentsRouter);
app.route('/api/wards', wardsRouter);
app.route('/api/prescriptions', prescriptionsRouter);
app.route('/api/lab-results', labResultsRouter);
app.route('/api/procedures', proceduresRouter);
app.route('/api/dashboard', dashboardRouter);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
