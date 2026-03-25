# Service Health Dashboard

A React + Vite dashboard that checks SystemLink service registry status and displays service health.

## Prerequisites

- Node.js (LTS recommended)
- npm
- Access to a SystemLink environment
- A SystemLink API key (for local development through the API proxy)

## Why a local proxy is required

When running this app locally, browser requests to SystemLink API domains are blocked by CORS.
Use the API Service Proxy to forward requests from localhost to your SystemLink API server.

## Run Locally

### 1. Start the API proxy

From `examples/Web Applications/Dev Tools/ApiServiceProxy`:

```bash
npm ci
```

Create `proxyConfig.js` from `proxyConfig.example.js`, then set:

- SystemLink API URL (for example, `https://demo-api.lifecyclesolutions.ni.com`)
- API key

Start proxy:

```bash
npm run start
```

The proxy runs at `http://localhost:4000`.

### 2. Configure this app for local development

In this project folder (`service-health-status`), `.env.development` should point to the proxy:

```bash
VITE_SYSTEMLINK_SERVER_URL=http://localhost:4000/apiProxy
```

This value is already configured in the repo.

### 3. Install and run the app

From `examples/Web Applications/Framework Examples/React/service-health-status`:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## Useful Commands

From this project folder:

```bash
npm run dev      # Start dev server
npm run build    # Build production assets into dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
npm run lint:fix # Run ESLint and auto-fix issues
```

## Production Behavior

For deployed builds, use `.env.production` with:

```bash
VITE_SYSTEMLINK_SERVER_URL=""
```

An empty value causes requests to use the current hosted domain (SystemLink web app host), where cookie-based auth is used.
