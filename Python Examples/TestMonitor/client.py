import sys
import requests

def print_usage_and_exit(error:str):
    print("This example requires a configuration.")
    print(error)
    print()
    print("Please specify a configuration using the following arguments:")
    print()
    print("\t <url> <api_key>")
    print()
    print("To run the example against a SystemLink Enterprise, the URL should include the")
    print("scheme, host, and port if not default. For example:")
    print("python <example_filename.py> https://myserver:9091 api_keynjnjnjnjnvgcycy")
    quit()

args = sys.argv

if len(args) == 3 :
    base_uri =args[1]
    api_key = args[2]
else:
    print_usage_and_exit("Please pass all the required arguments")

headers = { 'X-NI-API-KEY': api_key }

def post_request(host, body):
    request_uri = base_uri + host
    request_reponse =  requests.post(request_uri, json=body, headers=headers)

    return request_reponse.json()