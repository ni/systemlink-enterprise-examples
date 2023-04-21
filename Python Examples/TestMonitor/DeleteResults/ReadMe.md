Test Monitor Delete Results Example
=================

This is an python example demonstrating how to use the
SystemLink Enterprise Test Monitor API to create and delete test results.

Running the Example
-------------------

1. Clone _or_ download and extract the [repository source](https://github.com/ni/systemlink-enterprise-examples/archive/master.zip).
2. Install the [Python SDK](https://www.python.org/downloads/).

To run the example, use the following command:

```
python <filename.py> --server <server_url> <api_key>
```

For example: `python delete_results.py --server https://my_server apiKey`.

How to generate API key
-----------------------
Please refer to this [link](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/page/creating-an-api-key.html) for generating the API key

About the Example
-----------------

This example creates a single test result and deletes this created result by using Delete result Api and creates multiple(five) test results and deletes all these multiple results at a time by using delete-results POST Api.