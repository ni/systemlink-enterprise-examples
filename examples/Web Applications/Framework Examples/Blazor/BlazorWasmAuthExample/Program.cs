using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using BlazorWasmAuthExample;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// In dev, read the proxy URL from appsettings.Development.json.
// In production, use the SystemLink base address (session cookies handle auth).
var baseUrl = builder.HostEnvironment.IsDevelopment()
    ? builder.Configuration["ApiBaseUrl"]
        ?? throw new InvalidOperationException("ApiBaseUrl not configured. Copy appsettings.Development.json.example to appsettings.Development.json and set your proxy URL.")
    : builder.HostEnvironment.BaseAddress;

builder.Services.AddScoped(sp => new HttpClient 
{ 
    BaseAddress = new Uri(baseUrl) 
});

await builder.Build().RunAsync();