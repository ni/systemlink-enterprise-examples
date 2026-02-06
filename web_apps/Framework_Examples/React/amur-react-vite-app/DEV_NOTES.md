# Loading Assets in Production

`base: "./",`

In [./vite.config.ts](./vite.config.ts) make sure the config has a `base: "./",`
attribute. This makes references in the built code (`/dist`) use relative paths
to load assets in productions. Without relative paths, the webapp hosted in the
SystemLink website would try to retrieve assets from the root of the domain.

# DEV vs PROD Service Calls.

## Using VITE env files to switch service call destination

Vite will use the different env files whether we are running dev or building our
project for production. See the following
files:[.env.production](/amur-react-vite-app/.env.production)
[.env.development](/amur-react-vite-app/.env.development).

You should import the serverURL from the environment variable so the webapp will
work in both prod and dev:

```js
const systemLinkServerUrl: string = import.meta.env.VITE_SYSTEMLINK_SERVER_URL;
```

Then make any service calls to

```js
${systemLinkServerUrl}/PATH
```

where the PATH is exactly the same as the SWAGGER docs for the APIs.

## Dev Service calls explained

Our dev environment needs to call the API URL
(https://demo-api.lifecyclesolutions.ni.com). Since the API URL does not allow
cross origin, we need to create a proxy service that does. The proxy service
also allows us to authenticate with an API key for DEV, whereas production does
not use an API key

See the following
files:[.env.development](/amur-react-vite-app/.env.development) and
[proxyConfig.example.js](/amur-react-vite-app/serviceProxy/proxyConfig.example.js)

## Prod Service calls explained

Our production code cannot call the API URL do to strict browser security
reasons. However, the same endpoints are available at the SystemLink UI website
URL (https://demo.lifecyclesolutions.ni.com) and have the same paths. Note that
instead of an API key, a session-id is used to authenticate a user. The
session-id is stored as a cookie which will be sent automatically by the browser
with every request

All we need to do is call fetch with a path, no domain, and the browser will
send the request to the domain of the currently open website.

See the following file:[.env.production](/amur-react-vite-app/.env.production)

# Use .gitignore

Files with sensitive information (api keys) or files that do not need to be
tracked (node_nodules) should be added to a .gitignore so that they are not
pushed to github.

Create a file or add to existing .gitignore within a folder/parent folder.
