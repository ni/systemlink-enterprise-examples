# Blazor Server API Authentication Example

A Blazor Server application demonstrating authenticated API calls to SystemLink
services using NI's Nimble design system.

## Overview

This example shows how to:

- Create a Blazor Server application with interactive components
- Make authenticated API calls to SystemLink APIs
- Manage API keys securely using .NET User Secrets
- Configure environment-specific settings (Development vs Production)
- Use NI Nimble Blazor components for UI

## Prerequisites

- .NET 10.0 SDK or higher
- SystemLink API access
- API key for development (stored in User Secrets)
- NimbleBlazor NuGet package

## Nimble Design System Setup

This example uses NI's Nimble design system for Blazor components and styling.

### Installation

1. **Add the NuGet package:**

```bash
dotnet add package NimbleBlazor
```

2. **Configure in App.razor** (already done in this example):

The root `App.razor` file includes the necessary Nimble resources:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- ... other head content ... -->

    <!-- Nimble font tokens -->
    <link href="_content/NimbleBlazor/nimble-tokens/css/fonts.css" rel="stylesheet" />

    <HeadOutlet />
</head>

<body>
    <Routes />
    <ReconnectModal />

    <!-- Nimble components bundle (must be type="module") -->
    <script src="_content/NimbleBlazor/nimble-components/all-components-bundle.min.js" type="module"></script>

    <script src="@Assets["_framework/blazor.web.js"]"></script>
</body>
</html>
```

**Important:**

- The fonts CSS must be in `<head>`
- The components script must be type `module`
- The components script should load before `blazor.web.js`

### Using Nimble Components

In your `.razor` pages, you can use Nimble components directly:

```html
@page "/example"

<!-- Standard HTML button -->
<button @onclick="HandleClick">Standard Button</button>

<!-- Nimble button (from NI design system) -->
<nimble-button @onclick="HandleClick">Nimble Button</nimble-button>

<!-- Other Nimble components -->
<nimble-text-field></nimble-text-field>
<nimble-card>
  <h3 slot="title">Card Title</h3>
  Card content here
</nimble-card>
```

**Note:** In this example, we use a standard HTML `<button>` for simplicity, but
you can replace it with `<nimble-button>` for consistent NI styling.

### Nimble Tokens (Design Tokens)

Nimble also provides design tokens for colors, spacing, typography, etc.

The `nimble-tokens/css/fonts.css` loaded in `App.razor` provides:

- Font families (NI Sans, Source Code Pro)
- Font sizes and weights
- Line heights

You can reference these in your custom CSS:

```css
/* Using Nimble design tokens */
.title {
  font-family: var(--ni-nimble-body-font-family);
  font-size: var(--ni-nimble-body-font-size);
  color: var(--ni-nimble-body-font-color);
}
```

### Available Nimble Components

Common components you can use:

- `<nimble-button>` - Buttons with NI styling
- `<nimble-text-field>` - Input fields
- `<nimble-select>` - Dropdown selects
- `<nimble-card>` - Card containers
- `<nimble-table>` - Data tables
- `<nimble-dialog>` - Modal dialogs
- `<nimble-banner>` - Alert/notification banners

### Resources

- [Nimble Blazor GitHub](https://github.com/ni/nimble/tree/main/packages/blazor-workspace)
- [Nimble Storybook (Component Gallery)](https://nimble.ni.dev/)
- [Nimble Design Tokens](https://github.com/ni/nimble/tree/main/packages/tokens)

### Troubleshooting Nimble

**Components not rendering:**

- Check that `all-components-bundle.min.js` is loading (Network tab in DevTools)
- Verify the script tag has `type="module"`
- Ensure NimbleBlazor NuGet package is installed

**Styling issues:**

- Confirm `nimble-tokens/css/fonts.css` is loaded
- Check browser console for font loading errors
- Verify CSS variable names match Nimble tokens

## Project Structure

```
BlazorApp1/
├── Components/
│   ├── Pages/
│   │   └── API.razor          # API demonstration page
│   └── Layout/
│       ├── MainLayout.razor   # Main layout component
│       └── NavMenu.razor      # Navigation menu
├── wwwroot/
│   ├── css/
│   │   └── app.css            # Custom styles
│   └── lib/                   # Static libraries (Bootstrap, etc.)
├── App.razor                  # Root component (Nimble setup here!)
├── Program.cs                 # App configuration
├── appsettings.json           # Configuration (ServerUrl)
└── BlazorApp1.csproj          # Project file (NuGet packages)
```

**Key Files:**

- `App.razor` - Loads Nimble fonts and components bundle
- `API.razor` - Demonstrates API calls with Nimble styling
- `Program.cs` - Configures InteractiveServer mode

## Setup Instructions

### 1. Initialize User Secrets

```bash
cd BlazorApp1
dotnet user-secrets init
```

### 2. Add Your API Key

```bash
dotnet user-secrets set "SystemLink:ApiKey" "your-api-key-here"
```

### 3. Configure SystemLink URL

Edit `appsettings.json`:

```json
{
  "SystemLink": {
    "ServerUrl": "https://test-api.lifecyclesolutions.ni.com"
  }
}
```

### 4. Run the Application

```bash
dotnet run
```

Navigate to `https://localhost:XXXX/API`

## How It Works

### Development

1. User Secrets store the API key securely (outside the repository)
2. `appsettings.json` provides the SystemLink server URL
3. `Program.cs` configures services with InteractiveServer render mode
4. API.razor makes authenticated requests using injected HttpClient
5. Server executes C# code and makes API calls server-to-server
6. SignalR updates the browser UI with results
7. No CORS issues (server-to-server communication)

### Key Configuration

**Program.cs:**

```csharp
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();  // Enables interactivity

builder.Services.AddHttpClient();  // For making API calls
```

## API Example

The `API.razor` page demonstrates:

### Component Setup

```razor
@page "/API"
@rendermode InteractiveServer
@layout MainLayout
@inject HttpClient Http
@inject IConfiguration Configuration
```

### Configuration Loading

```csharp
protected override void OnInitialized()
{
    // Load from appsettings.json
    systemLinkServerUrl = Configuration["SystemLink:ServerUrl"]
        ?? throw new InvalidOperationException("SystemLink ServerUrl not configured");

    // Load from User Secrets (development)
    apiKey = Configuration["SystemLink:ApiKey"]
        ?? throw new InvalidOperationException("SystemLink API not configured");
}
```

### Making Authenticated API Calls

```csharp
private async Task handleClick()
{
    clickCount++;
    Console.WriteLine($"Button Clicked! Count: {clickCount}");

    try
    {
        Console.WriteLine($"Calling: {systemLinkServerUrl}/niauth/v1/auth");

        var request = new HttpRequestMessage(HttpMethod.Get,
            $"{systemLinkServerUrl}/niauth/v1/auth");

        request.Headers.Add("x-ni-api-key", apiKey);

        var response = await Http.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"{data}");

        apiResponse = data;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
    }
}
```

### UI Features

- Click counter to verify interactivity is working
- Real-time display of API responses
- Console logging for debugging

## Architecture

```
┌─────────────────┐
│  Browser        │
│                 │
│  Displays UI    │
│  Click count: 3 │
└────────┬────────┘
         │
         │ SignalR/WebSocket
         │ (Real-time updates)
         ↓
┌─────────────────────────────┐
│  Blazor Server              │
│  (Your Machine/Server)      │
│                             │
│  - C# code executes here    │
│  - Makes API calls          │
│  - Manages state            │
│  - apiKey stored here       │
└────────┬────────────────────┘
         │
         │ HTTP GET + x-ni-api-key header
         ↓
┌─────────────────────────────┐
│  SystemLink API             │
│  /niauth/v1/auth            │
└─────────────────────────────┘
```

## Dependencies

This project uses:

- **NimbleBlazor** (NuGet package) - NI's design system for Blazor
  - Provides web components and design tokens
  - Installed via: `dotnet add package NimbleBlazor`
  - Configured in `App.razor` (fonts CSS + components bundle)
- **Bootstrap** - For general layout and styling
- **.NET 10** - Latest .NET framework
- **Blazor Server** - Server-side rendering with SignalR

### NuGet Packages

```xml
<PackageReference Include="NimbleBlazor" Version="x.x.x" />
```

Check `BlazorApp1.csproj` for the exact version.

## Security Notes

- ✅ API keys stored in User Secrets (development)
- ✅ User Secrets NOT committed to Git
- ✅ Server-to-server API calls (no CORS issues)
- ✅ API keys never exposed to browser
- ✅ All API logic executes server-side
- ⚠️ For production, use environment variables or Azure Key Vault

## Troubleshooting

### "SystemLink ApiKey not configured"

```bash
# Check User Secrets
dotnet user-secrets list

# If empty, set the API key
dotnet user-secrets set "SystemLink:ApiKey" "your-key"
```

### "SystemLink ServerUrl not configured"

Edit `appsettings.json` and add:

```json
{
  "SystemLink": {
    "ServerUrl": "https://your-systemlink-server.com"
  }
}
```

### Click Counter Not Updating

This indicates interactivity is not working. Check:

- `@rendermode InteractiveServer` is on the page
- `AddInteractiveServerComponents()` is in `Program.cs`
- SignalR connection is established (check browser console)

### CORS Errors

Blazor Server should NOT have CORS errors since API calls are server-to-server.
If you see CORS errors, you may be using WebAssembly instead of Server.

## Comparison: Server vs WebAssembly

| Feature                   | Blazor Server (This Example) | Blazor WebAssembly           |
| ------------------------- | ---------------------------- | ---------------------------- |
| **Where code runs**       | Your server                  | User's browser               |
| **CORS issues**           | ❌ No (server-to-server)     | ✅ Yes (needs proxy)         |
| **API key location**      | Server (secure)              | Browser config (less secure) |
| **Initial load**          | Fast (~2KB)                  | Slow (~7MB download)         |
| **Offline support**       | ❌ No                        | ✅ Yes                       |
| **Server resources**      | High (per user)              | Low (static files)           |
| **SystemLink deployment** | ❌ Not supported             | ✅ Supported via NIPKG       |
| **Best for**              | Internal enterprise apps     | Public/SystemLink web apps   |

## Why Not Deploy to SystemLink?

Blazor Server requires:

- ❌ .NET runtime on server
- ❌ Active server process for each user
- ❌ SignalR WebSocket connections
- ❌ Cannot be packaged as static files

SystemLink web apps expect:

- ✅ Static files (HTML, JS, CSS, WASM)
- ✅ No server-side execution
- ✅ NIPKG package format

**For SystemLink deployment, use the
[Blazor WebAssembly example](../BlazorWasmAuthExample/) instead.**

## Use Cases for This Example

✅ **Good for:**

- Internal enterprise applications
- Corporate intranet tools
- Rapid prototyping with SystemLink APIs
- Learning Blazor Server concepts
- Applications requiring server-side processing
- When you control the hosting environment

❌ **Not suitable for:**

- SystemLink web app deployment
- Public-facing applications
- High-scale scenarios (many concurrent users)
- Offline-first applications

## Related Examples

- [Blazor WebAssembly Auth Example](../BlazorWasmAuthExample/) - For SystemLink
  deployment
- [React Example](../../React/) - Alternative framework approach

## References

- [Blazor Server Documentation](https://learn.microsoft.com/aspnet/core/blazor/hosting-models#blazor-server)
- [User Secrets in .NET](https://learn.microsoft.com/aspnet/core/security/app-secrets)
- [NI Nimble Blazor Components](https://github.com/ni/nimble/tree/main/packages/blazor-workspace)
- [SystemLink API Documentation](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/)
