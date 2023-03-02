SystemLink Enterprise API Examples
==============================

This directory holds self-contained python scripts for the
SystemLink Enterprise APIs. 

Running an Example
------------------

Unless otherwise specified by the example's README, each example is run in the
same way:

1. Clone _or_ download and extract the [repository source](https://github.com/ni/systemlink-enterprise-examples/archive/master.zip).
2. Install the [Python SDK](https://www.python.org/downloads/).

To run the example, use the following command:

```
python <filename.py> <url> <api_key>
```

For example: `python results.py https://my_server apiKey`.

API Examples
------------
### [Test Monitor](TestMonitor)

- [Results](TestMonitor/results.py): Demonstrates how to use the SystemLink Test Monitor API to publish test results to the server.