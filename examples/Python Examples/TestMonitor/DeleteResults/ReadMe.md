Test Monitor Delete Results Example
=================

This is a python example demonstrating how to use the
SystemLink Enterprise Test Monitor APIs to create and delete test results.

How to run the example?
-----------------------

1. Clone _or_ download and extract the [repository source](https://github.com/ni/systemlink-enterprise-examples/archive/master.zip).
2. Install the [Python SDK](https://www.python.org/downloads/).
3. Install all the libraries mentioned in the [requirements.txt](../requirements.txt) by running `pip install requirements.txt` in command prompt.
4. To run the example, use the following command:

    ```
    python <filename.py> --server <server_url> <api_key>
    ```

    For example: `python delete_results.py --server https://my_server apiKey`.

How to generate API key?
------------------------
Please refer to this [link](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/page/creating-an-api-key.html) for generating the API key.

About the example
-----------------

This example has two sections. The example in the first section creates a single test result and deletes the created result by using delete-result API. The example in the second section creates multiple(five) test results and deletes all the created results at once using the delete-results API.