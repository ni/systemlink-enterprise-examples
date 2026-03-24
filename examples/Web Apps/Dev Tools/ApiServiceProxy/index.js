import express from 'express';

import cors from 'cors';

import { apiKey, apiServerUrl } from './proxyConfig.js';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple proxy endpoint

app.all('/apiProxy/*splat', async (req, res) => {
    const forwardPath = req.originalUrl.replace(/^\/apiProxy/, '');
    const forwardFullUrl = `${apiServerUrl}${forwardPath}`;

    const forwardReq = {
        method: req.method,
        headers: {
            'x-ni-api-key': apiKey,
        },
        body: req.body,
    };

    try {
        const upstreamResponse = await fetch(forwardFullUrl, forwardReq);

        if (!upstreamResponse.ok) {
            return res.status(upstreamResponse.status).send({});
        }

        const data = await upstreamResponse.json();
        return res.json(data);
    } catch (err) {
    // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).send({ error: 'Proxy server error' });
    }
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
