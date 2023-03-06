import sys
import requests

create_results_host = "nitestmonitor/v2/results"
create_steps_host = "nitestmonitor/v2/steps"
update_results_host = "nitestmonitor/v2/update-results"
update_steps_host = "nitestmonitor/v2/update-steps"

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


def create_test_result_request(results: dict) -> dict:
    """
    Creates a create test result request object 
    dictionary required for creating the new test results.
    :param results: List of results that needs to create
    :return: A dictionary which is required for creating the results
    """
    return {
        "results":results
    }

def test_step_create_or_update_request_object(steps: dict, update_result_total_time: bool=True) -> dict:
    """
    Creates a create/update test result request object 
    dictionary required for creating the new/update existing test steps.
    :param results: List of steps that needs to create/update
    :param update_result_total_time: A boolean to state 
    whether to update result total time or not
    :return: A dictionary which is required for creating/updating the steps
    """
    return{
        "steps": steps,
        "updateResultTotalTime": update_result_total_time
    }

def update_test_results_request(results: dict, determine_status_from_steps: bool=True) -> dict:
    """
    Creates a update test result request object 
    dictionary required for updating the existing test results.
    :param results: List of results that needs to be updated
    :param determine_status_from_steps: A boolean representing 
    whether the status of result should be updated based on result or not
    :return: A dictionary which is required for updating the results
    """
    return{
        "results": results,
        "determineStatusFromSteps": determine_status_from_steps
    }


def create_results(results):
    body = create_test_result_request(results)
    request_uri = base_uri + create_results_host
    request_reponse =  requests.post(request_uri, json=body, headers=headers)

    return request_reponse.json()

def update_results(results):
    body = update_test_results_request(results, determine_status_from_steps=True)
    request_uri = base_uri + update_results_host
    request_reponse =  requests.post(request_uri, json=body, headers=headers)

    return request_reponse.json()

def create_steps(steps):
    body = test_step_create_or_update_request_object(
            steps, update_result_total_time=True
        )
    request_uri = base_uri + create_steps_host
    request_reponse =  requests.post(request_uri, json=body, headers=headers)

    return request_reponse.json()

def update_steps(steps):
    body = test_step_create_or_update_request_object(
                steps, update_result_total_time=True
            )
    request_uri = base_uri + update_steps_host
    request_reponse =  requests.post(request_uri, json=body, headers=headers)

    return request_reponse.json()