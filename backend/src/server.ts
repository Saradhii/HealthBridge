import { serve } from '@hono/node-server';
import app from './index';

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`Starting server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on http://localhost:${port}`);
