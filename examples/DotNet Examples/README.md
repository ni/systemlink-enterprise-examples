SystemLink Enterprise API Examples
==============================

This directory holds self-contained example projects for the
SystemLink Enterprise APIs. 

Running an Example
------------------

Unless otherwise specified by the example's README, each example is run in the
same way:

1. Clone this repo _or_ download and extract the [repository source](https://github.com/ni/systemlink-enterprise-examples/archive/master.zip).
2. Install the [.NET Core SDK](https://dotnet.microsoft.com/download/dotnet-core).
3. Navigate to the example's directory and use the [`dotnet run` command](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-run?tabs=netcore21).

To run the example with a different configuration, use the following
commands instead:

```
dotnet run --server <url> <api_key>
```

For example: `dotnet run --server https://my_server api_key`.

How to generate API key
-----------------------
Please refer to this [link](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/page/creating-an-api-key.html) for generating the API key

Solution File
-------------

For convenience, the [NISystemLinkEnterpriseExamples.sln](NISystemLinkEnterpriseExamples.sln)
[solution file](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-sln)
can be used to build all example projects at once. Some development environments
such as [Visual Studio](https://visualstudio.microsoft.com/) also support using
the solution file to view and run all example projects at once. Note that the
`dotnet run` command used to run an example requires referencing individual
projects and does not support the solution file.

API Examples
------------
### [Test Monitor](testmonitor)

- [CreateResultsAndSteps](TestMonitor/CreateResultsAndSteps): Demonstrates how to use the SystemLink Test Monitor API to publish test results to the server.
- [DeleteResults](TestMonitor/DeleteResults): Demonstrates how to use the SystemLink Test Monitor API to create and delete test results.