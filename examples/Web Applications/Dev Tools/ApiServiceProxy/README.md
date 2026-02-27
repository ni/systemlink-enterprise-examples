# API Service Proxy

The API Service Proxy is used to **locally** run web applications that call
SystemLink APIs.

## Purpose -- Local development

The API Service Proxy is used to forward requests to a SystemLink API server
(e.g. https://demo-api.lifecyclesolutions.ni.com). The forward proxy is
necessary because the API server does not allow cross origin sharing (no CORS).

The service proxy should be used when testing a web application in a local
environment. An api key is required to authorize requests made to a SystemLink
API server.

### Do not make calls through the proxy in production

Web applications that are hosted in a SystemLink environment should route
requests to the environment's domain (i.e.
https://demo.lifecyclesolutions.ni.com).

The endpoints in the SystemLink deployment environment are the same as the
SystemLink API endpoints, but authorization is done via a cookie which the
browser will automatically send with the request.

## Setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create a `proxyConfig.js` from `proxyConfig.example.js` and add your
   SystemLink API URL and API key

3. Start the backend server:

   ```bash
   node index.js
   ```

4. Server will be running on `localhost:4000`
