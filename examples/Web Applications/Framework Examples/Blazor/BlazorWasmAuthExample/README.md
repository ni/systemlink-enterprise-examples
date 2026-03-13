# Blazor WebAssembly API Authentication Example

A Blazor WebAssembly application demonstrating authenticated API calls to
SystemLink services using NI's Nimble design system.

## Overview

This example shows how to:

- Create a Blazor WebAssembly application that calls SystemLink APIs
- Authenticate with an API key in development and session cookies in production
- Display API results in a `NimbleTable` from NI's Nimble design system
- Configure environment-specific settings without exposing secrets

## Prerequisites

- .NET 10.0 SDK or higher
- SystemLink API access
- A local proxy that injects your API key (configured in
  `appsettings.Development.json`)
- NimbleBlazor NuGet package

## Project Structure

```
BlazorWasmAuthExample/
├── wwwroot/
│   ├── appsettings.Development.json          ← NOT in Git (your proxy URL)
│   ├── appsettings.Development.json.example  ← IN Git (template)
│   ├── css/
│   │   └── app.css
│   └── index.html                            ← Nimble fonts, script, and theme provider
├── Pages/
│   ├── API.razor                             ← API page with NimbleTable display
│   └── API.razor.css                         ← Page-scoped styles
├── Layout/
│   ├── MainLayout.razor
│   └── NavBar.razor                          ← NavBar using Nimble components
├── _Imports.razor                            ← Global @using statements (includes NimbleBlazor)
├── App.razor
├── Program.cs                                ← Loads config, configures HttpClient
├── BlazorWasmAuthExample.csproj             ← NimbleBlazor NuGet package reference
└── .gitignore                                ← Ignores appsettings.Development.json
```

## How It Works

### Development

1. You create `appsettings.Development.json` (gitignored) with your proxy URL
   (see DevTools folder)
2. `Program.cs` reads `ApiBaseUrl` from config and sets it as the `HttpClient`
   base address
3. All requests go to your local proxy (e.g. `http://localhost:4000/apiProxy/`)
4. The proxy forwards the request to SystemLink and injects your API key
5. ✅ Works — the API key never touches the Blazor app directly

### Production (SystemLink)

1. `appsettings.Development.json` is not included in the build
2. `Program.cs` falls back to `builder.HostEnvironment.BaseAddress`
3. `HttpClient` uses relative URLs on the same domain as SystemLink
4. The browser sends session cookies automatically
5. ✅ Works — no configuration needed

## Development Setup

### 1. Copy the Config Template

```bash
cp BlazorWasmAuthExample/wwwroot/appsettings.Development.json.example \
   BlazorWasmAuthExample/wwwroot/appsettings.Development.json
```

### 2. Set Your Proxy URL

Edit `appsettings.Development.json` and point `ApiBaseUrl` at your local proxy:

```json
{
  "ApiBaseUrl": "http://localhost:<your-proxy-port>/apiProxy/"
}
```

The proxy is responsible for adding your API key to outgoing requests. The
Blazor app itself never handles the key. See the [Dev Tools folder](../Dev
Tools/ApiServiceProxy) for the development proxy.

### 3. Run the Application

```bash
cd BlazorWasmAuthExample
dotnet run
```

Navigate to `https://localhost:XXXX/API`.

## Dependencies

- **NimbleBlazor** — NI's design system for Blazor; provides `NimbleTable`,
  `NimbleTableColumnText`, fonts, and design tokens
- **Microsoft.AspNetCore.Components.WebAssembly** — Blazor WASM runtime
- **.NET 10** — target framework

## Production Setup

### Deploy to SystemLink

Use the included `deploy.sh` script to build and publish the app:

```bash
./deploy.sh <webapp-name> <workspace>

# Example:
./deploy.sh BLAZOR_APP BYU2026
```

### What the Script Does

| Step | Command                                  | Purpose                                                                           |
| ---- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| 1    | `rm -rf pub`                             | Cleans previous build output to avoid stale files                                 |
| 2    | `dotnet publish -o pub`                  | Builds a release-optimized WASM bundle into `pub/`                                |
| 3    | Parse `*.staticwebassets.endpoints.json` | Reads the asset manifest to find the fingerprinted filename for `dotnet.js`       |
| 4    | `cp dotnet.<hash>.js dotnet.js`          | Copies the fingerprinted file to the virtual path (see below under "Common Bugs") |
| 5    | `slcli webapp pack pub/wwwroot`          | Packs the static files into a `.nipkg` for SystemLink                             |
| 6    | `slcli webapp publish`                   | Uploads and registers (or updates) the app on SystemLink                          |
| 7    | `slcli webapp open`                      | Opens the deployed app in the browser                                             |

## Security Notes

- ✅ API key is handled entirely by the local proxy — never stored in the Blazor
  app
- ✅ `appsettings.Development.json` is gitignored and only contains a proxy URL
- ✅ Development config is never included in the production build
- ✅ Production uses session cookies (managed by SystemLink)
- ✅ No secrets ever committed to the repository

## Nimble Design System Setup

This example uses NI's Nimble design system for Blazor components.

### 1. Add the NuGet Package

```bash
dotnet add package NimbleBlazor
```

This is already done in `BlazorWasmAuthExample.csproj`:

```xml
<PackageReference Include="NimbleBlazor" Version="20.12.4" />
```

### 2. Configure index.html

Add the Nimble CSS and component bundle to `wwwroot/index.html`:

```html
<head>
  <!-- ... other head content ... -->

  <!-- Nimble fonts -->
  <link
    href="_content/NimbleBlazor/nimble-tokens/css/fonts.css"
    rel="stylesheet"
  />

  <!-- Nimble components bundle (must be type="module") -->
  <script
    src="_content/NimbleBlazor/nimble-components/all-components-bundle.min.js"
    type="module"
  ></script>
</head>

<body>
  <!-- Wrap app in theme provider so Nimble tokens apply globally -->
  <nimble-theme-provider color-scheme="light">
    <div id="app">...</div>
  </nimble-theme-provider>

  <script src="_framework/blazor.webassembly#[.{fingerprint}].js"></script>
</body>
```

**Important:**

- The fonts CSS link must be in `<head>`
- The components script must have `type="module"`
- Wrap the app root in `<nimble-theme-provider>` so design tokens are applied
- Do **not** add `nimble-tokens/css/all.css` — that path does not exist in the
  WASM static asset layout and will produce a 404. The component bundle loads
  the remaining tokens internally.

### 3. Add the Global Using Statement

`_Imports.razor` includes `@using NimbleBlazor` so all pages can use Nimble
components without per-file imports:

```razor
@using NimbleBlazor
```

### Resources

- [Nimble Blazor GitHub](https://github.com/ni/nimble/tree/main/packages/blazor-workspace)
- [Nimble Storybook (Component Gallery)](https://nimble.ni.dev/)
- [Nimble Design Tokens](https://github.com/ni/nimble/tree/main/packages/tokens)

## API Example

The `API.razor` page demonstrates how to make an authenticated HTTP GET request
and display the result in a `NimbleTable`.

### Component Setup

```razor
@page "/API"
@page "/"
@page "/{**catchAll}"
@inject HttpClient Http
@layout MainLayout
@using System.Text.Json
```

(`@using NimbleBlazor` is inherited from `_Imports.razor`.)

### NimbleTable Display

The response is shown in a four-column table — one row per API endpoint:

```razor
<NimbleTable TData="ApiRow" @ref="table" IdFieldName="Route" style="height: 180px; width: 100%;">
    <NimbleTableColumnText FieldName="Method">Method</NimbleTableColumnText>
    <NimbleTableColumnText FieldName="Route">Route</NimbleTableColumnText>
    <NimbleTableColumnText FieldName="Description">Description</NimbleTableColumnText>
    <NimbleTableColumnText FieldName="Response">Response</NimbleTableColumnText>
</NimbleTable>
```

`TData="ApiRow"` is required — Blazor cannot infer the generic type argument
from the markup alone, so it must be specified explicitly as an attribute.

The table is bound to a C# record whose property names match the `FieldName`
values on each column:

```csharp
private record ApiRow(string Method, string Route, string Description, string Response);
```

Data is pushed to the table via `SetDataAsync`, which uses JavaScript interop
under the hood. It is called on first render and again after each API call:

```csharp
private NimbleTable<ApiRow>? table;

protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender)
    {
        await UpdateTableAsync();
    }
}

private async Task UpdateTableAsync()
{
    if (table != null)
    {
        await table.SetDataAsync(new[]
        {
            new ApiRow(
                "GET",
                "/niauth/v1/auth",
                "Authenticates API Keys",
                string.IsNullOrEmpty(apiResponse)
                    ? "No response yet. Click the button to make an API call."
                    : apiResponse
            )
        });
    }
}
```

### Making Authenticated API Calls

```csharp
private async Task HandleClick()
{
    try
    {
        // API key is already in HttpClient's default headers (development only)
        var response = await Http.GetAsync("niauth/v1/auth");

        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadAsStringAsync();

        // Pretty-print the JSON response
        using var doc = JsonDocument.Parse(data);
        apiResponse = JsonSerializer.Serialize(
            doc.RootElement,
            new JsonSerializerOptions { WriteIndented = true }
        );
    }
    catch (Exception ex)
    {
        apiResponse = $"Error: {ex.Message}";
    }

    await UpdateTableAsync();
}
```

### UI Features

- **NimbleTable** — displays method, route, description, and response in a
  structured NI-styled table
- **`nimble-button`** — the trigger button uses
  `<nimble-button appearance="outline">` for consistent NI styling
- **Pretty-printed JSON** — the raw API response is parsed and re-serialized
  with indentation before being stored in the Response column
- **Placeholder text** — before the button is clicked, the Response cell shows a
  "No response yet" message
- **Hover tooltip** — hovering a truncated table cell shows its full text,
  useful for long JSON responses

# Common Bugs

### The Fingerprinted `dotnet.js` Problem

In .NET 10, Blazor inlines the boot configuration directly into `dotnet.js` and
renames it with a content hash, producing a file like:

```
_framework/dotnet.5y8w35dinf.js
```

At runtime, **ASP.NET Core middleware** transparently maps the virtual path
`_framework/dotnet.js` to this fingerprinted file. The `index.html` script tag
references the virtual path `_framework/dotnet.js`, and middleware resolves it
behind the scenes.

**SystemLink serves files statically** — there is no ASP.NET Core middleware
running. When the browser requests `_framework/dotnet.js`, SystemLink looks for
that exact filename, finds nothing, and the app fails to boot.

The fix is step 4: before packing, the script reads the asset manifest to find
the real fingerprinted filename and copies it to `dotnet.js`, creating the file
that the static server actually needs.

```bash
# From *.staticwebassets.endpoints.json, the manifest entry looks like:
# "Route":"_framework/dotnet.js","AssetFile":"_framework/dotnet.5y8w35dinf.js"
#
# The script extracts the AssetFile name and copies it:
cp _framework/dotnet.5y8w35dinf.js _framework/dotnet.js
```

This copy is safe to do unconditionally — the fingerprinted file remains in
place for cache-busting, and `dotnet.js` is added as the stable entry point that
the static server can resolve.

### The Routing Problem and Workaround

When a Blazor WASM app is hosted on SystemLink, it is served from a deep
sub-path such as:

```
/niapp/v1/webapps/<webapp-id>/content/
```

Blazor's router uses `document.baseURI` (the page URL) as its base when no
`<base>` tag is present. Without a `<base>` tag, the relative route it extracts
from the URL may not match any defined `@page` route — causing the router to
fall through to `<NotFound>` and display a blank page on load or reload.

Adding a `<base href="...">` tag is the standard fix, but it cannot be hardcoded
because the webapp ID changes for each app registration (a new deployment under
a different name produces a new ID). Injecting it dynamically via an inline
`<script>` is also blocked by SystemLink's Content Security Policy, which
forbids `'unsafe-inline'` scripts and styles.

### Solution: Catchall Route

`API.razor` registers a catchall route alongside its normal routes:

```razor
@page "/API"
@page "/"
@page "/{**catchAll}"
```

`/{**catchAll}` matches **any** URL path, including the deep SystemLink
sub-path. Blazor's `<Found>` branch always fires, and the API page renders
correctly regardless of the deployment URL or whether the user reloads.

The corresponding `[Parameter]` in `@code` prevents a compiler warning about an
unbound route parameter:

```csharp
[Parameter] public string? CatchAll { get; set; }
```

### Why Not a `<base>` Tag?

- The webapp ID (`/niapp/v1/webapps/<id>/content/`) differs per app
  registration, so it cannot be safely hardcoded.
- Dynamically writing it with an inline script violates SystemLink's CSP.
- The catchall route approach requires no per-deployment configuration and works
  for any number of separately registered apps.

## Troubleshooting

### NimbleTable Not Rendering

- Check that `all-components-bundle.min.js` is loading (Network tab in DevTools)
- Verify the script tag has `type="module"`
- Confirm the NimbleBlazor NuGet package is installed (`dotnet restore`)

### Response Column Never Updates After Click

- Ensure `HandleClick` calls `await UpdateTableAsync()` after setting
  `apiResponse`
- Check the browser console for JavaScript interop errors

### "ApiBaseUrl not configured" Error on Startup

```bash
# Confirm the file exists and has the correct proxy URL
cat BlazorWasmAuthExample/wwwroot/appsettings.Development.json
```

If missing, copy the example template:

```bash
cp BlazorWasmAuthExample/wwwroot/appsettings.Development.json.example \
   BlazorWasmAuthExample/wwwroot/appsettings.Development.json
```

### dotnet build failure

- Check that previous processes are not holding resources such as
  addresses/ports (common in windows). If so, kill those processes and
  re-attempt dotnet build.

## Related Examples

- [Blazor Server Example](../BlazorApp1/) — Server-side rendering with SignalR,
  uses User Secrets instead of appsettings files

## References

- [Blazor WebAssembly Documentation](https://learn.microsoft.com/aspnet/core/blazor/hosting-models#blazor-webassembly)
- [NI Nimble Blazor Components](https://github.com/ni/nimble/tree/main/packages/blazor-workspace)
- [NimbleTable Storybook](https://nimble.ni.dev/?path=/docs/table--docs)
- [SystemLink API Documentation](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/)
