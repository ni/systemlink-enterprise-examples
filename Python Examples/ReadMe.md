SystemLink Enterprise API Examples
==============================

This directory holds self-contained python scripts for the
SystemLink Enterprise APIs. 

Running an Example
------------------

Unless otherwise specified by the example's README, each example is run in the
same way:

1. Clone _or_ download and extract the [repository source](https://github.com/ni/systemlink-enterprise-examples/archive/master.zip).
2. Install the [Python SDK](https://www.python.org/downloads/) version 3.8 or higher.

To run the example, use the following command:

```
python <filename.py> <url> <api_key>
```

For example: `python create_results_and_steps.py https://my_server apiKey`.

API Examples
------------
### [Test Monitor](TestMonitor)

- [CreateResultsAndSteps](TestMonitor/CreateResultsAndSteps/create_results_and_steps.py): Demonstrates how to use the SystemLink Test Monitor API to publish test results to the server.