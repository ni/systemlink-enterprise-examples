import { serve } from '@hono/node-server';
import { app } from './lib/app';

serve({
  fetch: app.fetch,
  port: 8000,
  hostname: '127.0.0.1'
});
