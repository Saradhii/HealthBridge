import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import rolesRouter from './routes/roles';
import usersRouter from './routes/users';
import patientsRouter from './routes/patients';
import appointmentsRouter from './routes/appointments';
import wardsRouter from './routes/wards';
import dashboardRouter from './routes/dashboard';

const app = new Hono();

app.use('/*', cors());

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

// auto-added so vercel-entry can import { app }
export { app as app };
