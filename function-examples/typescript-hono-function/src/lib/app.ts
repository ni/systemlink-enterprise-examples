import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { logger } from 'hono/logger';

export const app = new Hono();

app.use(logger());

// Required: Root endpoint for default execution via GET
app.get('/', c => {
  const name = c.req.query('name');

  if (name) {
    return c.text(`Hello ${name}!`);
  }

  return c.text('Hello World!');
});

// Additional endpoint examples
app.get('/random', c => {
  const randomNumber = Math.floor(Math.random() * 1000) + 1;
  return c.json({ random_number: randomNumber });
});

app.post('/stats', async c => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestBody = await c.req.json();
    const values = (requestBody as { values?: unknown }).values;

    if (!Array.isArray(values) || values.some(v => typeof v !== 'number')) {
      return c.json({ error: 'values must be an array of numbers' }, 400);
    }

    const typedValues = values as number[];
    const sum = typedValues.reduce((a: number, b: number) => a + b, 0);
    const mean = sum / typedValues.length;
    const variance = typedValues.reduce((acc: number, x: number) => acc + (x - mean) ** 2, 0) / typedValues.length;
    const stdDev = Math.sqrt(variance);

    return c.json({
      min: Math.min(...typedValues),
      max: Math.max(...typedValues),
      mean,
      stdDev,
      count: typedValues.length,
    });
  } catch (error) {
    return c.json({ error: 'Invalid request format' }, 400);
  }
});

// Recommended: Info endpoint with simplified schema
app.get('/info', c => {
  return c.json({
    endpoints: {
      '/': {
        method: 'GET',
        description: 'Simple Hello World - optionally accepts "name" query parameter',
        parameters: {
          name: {
            type: 'string',
            location: 'query',
            required: false,
            description: 'Name to include in greeting'
          }
        }
      },
      '/info': {
        method: 'GET',
        description: 'Function documentation',
        parameters: {}
      },
      '/random': {
        method: 'GET',
        description: 'Generate random number',
        parameters: {}
      },
      '/stats': {
        method: 'POST',
        description: 'Compute statistics on number array',
        parameters: {
          values: {
            type: 'array',
            location: 'body',
            required: true,
            description: 'Array of numbers to compute statistics for',
            items: {
              type: 'number'
            }
          }
        }
      }
    }
  });
});

showRoutes(app, {
  verbose: true,
});
