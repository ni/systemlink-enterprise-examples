using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using BlazorWasmAuthExample;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// Simple: just point to proxy in dev, relative URLs in production
var baseUrl = builder.HostEnvironment.IsDevelopment()
    ? "http://localhost:4000"  // ← Your Node.js proxy
    : builder.HostEnvironment.BaseAddress;  // Production: same domain

builder.Services.AddScoped(sp => new HttpClient 
{ 
    BaseAddress = new Uri(baseUrl) 
});

await builder.Build().RunAsync();