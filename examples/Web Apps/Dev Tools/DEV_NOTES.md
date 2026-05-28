# Notes for Developing Web Apps

# Loading Assets/Files in Production

All assets/files need to be loaded from a relative path with a `.`
(`./path/asset` not `/path/asset`).

Without relative paths, the webapp hosted in the SystemLink website would try to
retrieve assets from the root of the website domain instead of from the webapp
path.

Build tools, such as bundlers, may need to be configured to use relative paths
instead of absolute paths.

**Example:**

- **Bad (without relative path):** `/path/asset` ->
  `demo.testsolutions.com/path/asset`
- **Good (with relative path):** `./path/asset`
  `demo.testsolutions.com/webapps/app/workspace/path/asset`

## Example: Relative path solution for Vite apps

`base: "./",`

In [./vite.config.ts](./vite.config.ts) make sure the config has a `base: "./",`
attribute. This makes references in the built code (`/dist`) use relative paths
to load assets/files in the production.

# Use .gitignore

Some files should not be tracked:

- Files containing sensitive or user specific information (such as api keys)
- distribution code (i.e. `dist/`. Distribution code can be recreated a build
  command)
- dependencies (such as `node_modules` which can be installed)

Add the file/directory to a new or existing .gitignore within the project
folder.

# DEV (local) vs. PROD Service Calls.

Service calls need to be routed to different domains depending on the
environment.

## Dev Service calls explained

The dev environment needs to call the API URL
(https://demo-api.lifecyclesolutions.ni.com). Since the API URL does not allow
cross origin, a proxy service is required. The proxy service also allows the
developer to authenticate with an API key, whereas production does not use an
API key (SL website authenticates with a cookie)

A proxy service is provided [Here](../../../Dev%20Tools/ApiServiceProxy/).
Follow the README to set it up.

## Prod Service calls explained

Production code cannot call the API URL do to strict browser security reasons
(nor does it make sense for the WebApp to use a hard code API key as the webapp
should be functional for all users (sessions), not just one (API key)).

However, the same endpoints are available at the SystemLink UI website URL
(https://demo.lifecyclesolutions.ni.com) and have the same URL paths. Note that
instead of an API key, a session-id is used to authenticate a user. The
session-id is stored as a cookie which will be sent automatically by the browser
with every request.

In production, the webapp only needs to fetch to a relative path.

```js
fetch("/auth/..");
```

The browser will make the fetch call to the domain in the address bar, the SL
website.

## Solution

Use environment variables/files to use proxy in development and the SL website
in production

## Example: VITE Solution for Dev vs. Prod service calls: Env files to switch service call destination

Vite will use the different env files whether we are running dev or building our
project for production. See the following
files:[.env.production](./.env.production)
[.env.development](./.env.development).

You should import the serverURL from the environment variable so the webapp will
work in both prod and dev:

```js
const systemLinkServerUrl: string = import.meta.env.VITE_SYSTEMLINK_SERVER_URL;
```

Then make any service calls to an api PATH (see SL API Swagger Docs) as followed

```js
${systemLinkServerUrl}/PATH
```
