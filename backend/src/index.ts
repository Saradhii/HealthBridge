import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import rolesRouter from './routes/roles';
import usersRouter from './routes/users';
import patientsRouter from './routes/patients';
import appointmentsRouter from './routes/appointments';
import wardsRouter from './routes/wards';
import dashboardRouter from './routes/dashboard';

type Bindings = {
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

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
app.route('/api/dashboard', dashboardRouter);

export default app;
