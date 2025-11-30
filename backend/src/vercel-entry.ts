import 'hono';
import { app } from './index';

// default export handler for @vercel/node
export default function handler(req: any, res: any) {
  if (typeof (app as any).handle === 'function') {
    return (app as any).handle(req, res);
  }
  if (typeof app === 'function') {
    return app(req, res);
  }
  res.statusCode = 500;
  res.end('Handler not configured');
}
