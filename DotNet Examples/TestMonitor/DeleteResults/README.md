Test Monitor Results Example
=================

This is an example console application demonstrating how to use the
SystemLink Test Monitor API to create and delete test results.

Running the Example
-------------------

1. Clone _or_ download and extract the [repository source](https://github.com/ni/systemlink-enterprise-examples/archive/master.zip).
2. Install the [.NET Core SDK](https://dotnet.microsoft.com/download/dotnet-core).
3. Navigate to the example's directory and use the [`dotnet run` command](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-run?tabs=netcore21).

To run the example, use the following command:

```
dotnet run -- --server <apiKey>
```

For example: `dotnet run --server https://my_server apiKey`.

About the Example
-----------------

This example creates a single test result and deletes this created result by using Delete result Api and creates multiple(five) test results and deletes all these multiple results at a time by using delete-results POST Api.