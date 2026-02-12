## How It Works

### Development

1. You create `appsettings.Development.json` (gitignored)
2. Put your API key there
3. `Program.cs` loads it at startup
4. Adds API key to HttpClient default headers
5. All requests automatically include the API key
6. ✅ Works!

### Production (SystemLink)

1. `appsettings.Development.json` doesn't exist (not in build)
2. `Program.cs` doesn't load any config
3. HttpClient uses relative URLs
4. Browser sends session cookies automatically
5. ✅ Works!

## Project Structure

```
BlazorApp1Wasm/
├── wwwroot/
│   ├── appsettings.Development.json          ← NOT in Git (your secret key)
│   ├── appsettings.Development.json.example  ← IN Git (template)
│   └── index.html
├── Pages/
│   └── API.razor
├── Program.cs                                ← Loads config
└── .gitignore                                ← Ignores Development.json
```

## Development Setup

1. Copy the config template:

```bash
   cp BlazorWasmAuthExample/wwwroot/appsettings.Development.json.example \
      BlazorWasmAuthExample/wwwroot/appsettings.Development.json
```

2. Edit `appsettings.Development.json` and add your API key:

```json
{
  "ApiBaseUrl": "https://test-api.lifecyclesolutions.ni.com",
  "ApiKey": "your-api-key-here"
}
```

3. Run the app:

```bash
   cd BlazorWasmAuthExample
   dotnet run
```
