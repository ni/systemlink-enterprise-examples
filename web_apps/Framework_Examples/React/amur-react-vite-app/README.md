# React Demo for SystemLink

A minimal setup to get this demo working on your local machine with a React
frontend and Node.js backend proxy.

For how to deploy the webapp to SystemLink, jump to
[here](#deploying-to-systemlink-website-using-the-systemlink-cli).

## Prerequisites

- **Node.js** v22.16.0 or higher

## Getting Started

### Backend Proxy Setup

> **Note:** The frontend calls a backend proxy running on `localhost:4000`,
> which in turn calls the SystemLink API server. This avoids CORS errors that
> would occur from direct frontend-to-server calls.

1. Navigate to the `service` directory:

   ```bash
   cd service
   ```

2. Create a `proxyConfig.js` from `proxyConfig.example.js` and add your
   SystemLink API URL and API key

3. Install dependencies:

   ```bash
   npm ci
   ```

4. Start the backend server:
   ```bash
   node index.js
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:

   ```
   http://localhost:5173
   ```

   Or type in `o + enter` to have vite open the browser and navigate for you.

## Testing

1. Click the **Make API Call** button in the application
2. You should see the response printed on the browser

---

## Deployment using the SystemLink CLI

Prereq:
**[Install](https://github.com/ni-kismet/systemlink-cli?tab=readme-ov-file#installation)**
the SystemLink CLI to your machine and
**[login](https://github.com/ni-kismet/systemlink-cli?tab=readme-ov-file#installation)**

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

#

For more information, visit the
[SystemLink Enterprise Examples repository](https://github.com/ni/systemlink-enterprise-examples)
