import express from 'express';

// const config = require(config.json);
// import config from './config.json' assert { type: 'json' };
import fs from 'fs';
import cors from 'cors';

const config = JSON.parse(
  fs.readFileSync(new URL('./config.json', import.meta.url))
);


const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple proxy endpoint
app.get('/api/ni-auth', async (req, res) => {
  try {
    const response = await fetch(
      'https://test-api.lifecyclesolutions.ni.com/niauth/v1/auth',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-ni-api-key': config.api_key
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).send({
        error: 'NI API request failed'
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
