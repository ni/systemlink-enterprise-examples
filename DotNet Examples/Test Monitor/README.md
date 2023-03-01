SystemLink Test Monitor Service API Examples
====================================

This directory holds self-contained example projects for the SystemLink Test Monitor service API. To make finding relevant examples easier, a summary of each one is listed below.

Running an Example
------------------

Unless otherwise specified by the example's README, each example is run in the
same way:

1. Clone _or_ download and extract the [repository source](https://github.com/ni/systemlink-enterprise-examples/archive/master.zip).
2. Install the [.NET Core SDK](https://dotnet.microsoft.com/download/dotnet-core).
3. Navigate to the example's directory and use the [`dotnet run` command](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-run?tabs=netcore21).

To run the example, use the following command:

```
dotnet run -- --server <url> <api_key>
```

For example: `dotnet run -- --server https://my_server api_keymnhvvhbjnkkkj`.

Test Monitor Examples
------------

- [Results](results): Demonstrates how to use the SystemLink Test Monitor API to create test results and steps.

