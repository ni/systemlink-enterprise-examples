# Blazor WebAssembly Demo for SystemLink

**[Live demo →](https://ni.github.io/systemlink-enterprise-examples/Blazor/SystemLinkAuthExample/)**

A minimal setup to get this demo working on your local machine with a Blazor
WebAssembly frontend.

For how to deploy the webapp to SystemLink, jump to
[here](#deploying-to-systemlink).

## Prerequisites

- [**.NET 10.0 SDK**](https://dotnet.microsoft.com/download/dotnet/10.0) or higher

## Getting Started -- Running Locally

### Backend Proxy Setup

> **Note:** The frontend calls a backend proxy running on `localhost:4000`,
> which in turn calls the SystemLink API server. This avoids CORS errors that
> would occur from direct frontend-to-server calls.

Make sure you have the [ApiServiceProxy](../../../Dev%20Tools/ApiServiceProxy/)
installed and have followed the setup in the README.

### Frontend Setup

1. Copy the config template:

   ```bash
   cp wwwroot/appsettings.Development.json.example \
      wwwroot/appsettings.Development.json
   ```

2. Edit `appsettings.Development.json` and set `ApiBaseUrl` to your local proxy:

   ```json
   {
     "ApiBaseUrl": "http://localhost:4000/apiProxy/"
   }
   ```

3. Run the application:

   ```bash
   dotnet run
   ```

4. Open your browser and navigate to the address printed in the console. For example: `http://localhost:5266`.

## Testing

1. Click the **Make API Call** button in the application
2. You should see the response printed on the browser

---

## Deploying to SystemLink

Use the included `deploy.sh` script to build and publish the app:

```bash
./deploy.sh <webapp-name> <workspace>

# Example:
./deploy.sh SYSTEMLINK_APP MY_WORKSPACE
```

---

## Known Workarounds

### dotnet.js Fingerprinting

In .NET 10, Blazor renames `dotnet.js` with a content hash (e.g.
`dotnet.5y8w35dinf.js`). ASP.NET Core middleware resolves the virtual path
`_framework/dotnet.js` at runtime, but SystemLink serves files statically and
requires the un-fingerprinted name to exist on disk.

The fix is applied automatically via an `AfterTargets="Publish"` MSBuild target
in the `.csproj`, which calls `fix-dotnet-fingerprint.sh` after every
`dotnet publish`. To apply the workaround without deploying:

```bash
./fix-dotnet-fingerprint.sh <publish-output-dir>
```

### Routing

Blazor's router uses the page URL as its base when no `<base>` tag is present.
When hosted on SystemLink at a deep sub-path (e.g.
`/niapp/v1/webapps/<id>/content/`), the route may not match any `@page`
directive, causing a blank page on load or reload. A hardcoded `<base>` tag is
not viable because the webapp ID changes per app registration, and an inline
script to set it dynamically is blocked by SystemLink's Content Security Policy.

The fix is a catchall route on `API.razor`:

```razor
@page "/{**catchAll}"
```

This matches any URL path so the page renders correctly regardless of the
deployment URL.

## References

- [Blazor WebAssembly Documentation](https://learn.microsoft.com/aspnet/core/blazor/hosting-models#blazor-webassembly)
- [NI Nimble Blazor Components](https://github.com/ni/nimble/tree/main/packages/blazor-workspace)
- [SystemLink API Documentation](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/)