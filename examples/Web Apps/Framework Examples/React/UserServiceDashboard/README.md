# Service Health Dashboard

A React + Vite dashboard that checks SystemLink service registry status and
displays service health.

## Prerequisites

- Node.js
- npm
- Access to a SystemLink environment
- A SystemLink API key (for local development through the API proxy)

## Why a local proxy is required

When running this app locally, browser requests to SystemLink API domains are
blocked by CORS. Use the API Service Proxy to forward requests from localhost to
your SystemLink API server.

## Run Locally

### 1. Start the API proxy

From `examples/Web Apps/Dev Tools/ApiServiceProxy`:

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

In this project folder (`ServiceHealthDashboard`), `.env.development` should
point to the proxy:

```bash
VITE_SYSTEMLINK_SERVER_URL=http://localhost:4000/apiProxy
```

This value is already configured in the repo.

### 3. Install and run the app

From `examples/Web Applications/Framework Examples/React/ServiceHealthDashboard`:

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

## Deployment using the SystemLink CLI

Prereq:
**[Install](https://github.com/ni-kismet/systemlink-cli?tab=readme-ov-file#installation)**
the SystemLink CLI to your machine and
**[login](https://github.com/ni-kismet/systemlink-cli?tab=readme-ov-file#installation)**
to the CLI.

1. `cd` into the project folder and run `npm run build` to create `dist/` folder
2. Create .nipkg file using `slcli webapp pack dist/`
3. Publish the webapp with
   `slcli webapp publish dist.nipkg --name NAME --workspace WORKSPACE`. Specify
   the webapp NAME and the user WORKSPACE
4. After any changes are made, repack the webapp (step 2) and update the webapp
   with `slcli webapp publish dist.nipkg --id ID`. (Use `slcli webapp list` to
   get the ID)

For more details on
[WebApp Management](https://github.com/ni-kismet/systemlink-cli?tab=readme-ov-file#installation)
see the SL-CLI docs
