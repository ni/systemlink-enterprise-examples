import sys
import requests
from typing import Any, Tuple, Dict, List

create_results_route = "nitestmonitor/v2/results"
create_steps_route = "nitestmonitor/v2/steps"
update_results_route = "nitestmonitor/v2/update-results"
update_steps_route = "nitestmonitor/v2/update-steps"

api_key = ""
base_uri = ""

def update_headers() -> None:
    global headers, api_key
    headers = { 'X-NI-API-KEY': api_key }

def set_base_url_and_api_key(server_uri: str, key: str) -> None:
    global api_key, base_uri
    base_uri = server_uri
    api_key = key
    update_headers()

headers = { 'X-NI-API-KEY': api_key }

def create_test_result_request(results: List) -> Dict:
    """
    Creates a create test result request object.
    :param results: List of results that needs to be created
    :return: A dictionary which is required for creating the results
    """
    return {
        "results":results
    }

def test_step_create_or_update_request_object(steps: List, update_result_total_time: bool = True) -> Dict:
    """
    Creates a create/update test step request object.
    :param results: List of steps that needs to be created/updated
    :param update_result_total_time: A boolean to state 
    whether to update result total time or not
    :return: A dictionary which is required for creating/updating the steps
    """
    return{
        "steps": steps,
        "updateResultTotalTime": update_result_total_time
    }

def update_test_results_request(results: List, determine_status_from_steps: bool = True) -> Dict:
    """
    Creates a update test result request object.
    :param results: List of results that needs to be updated
    :param determine_status_from_steps: A boolean representing 
    whether the status of result should be updated based on result or not
    :return: A dictionary which is required for updating the results
    """
    return{
        "results": results,
        "determineStatusFromSteps": determine_status_from_steps
    }

def create_results(results: List) -> Dict:
    """
    Creates new test results from the supplied models. The server automatically generates the result ids.
    :param results: Results which needs to be created
    :return: json response after creating the results
    """
    if len(results) == 0 :
        raise ValueError("Number of results needs to be created can not be empty")
    body = create_test_result_request(results)
    request_uri = base_uri + create_results_route
    request_response = raise_post_request(request_uri, body)

    return request_response.json()

def update_results(results: List) -> Dict:
    """
    Updates existing test results by merging or replacing values.
    :param results: Results which needs to be updated
    :return: json response after updating the results
    """
    if len(results) == 0 :
        raise ValueError("Number of results needs to be updated can not be empty")
    body = update_test_results_request(results, determine_status_from_steps=True)
    request_uri = base_uri + update_results_route
    request_response = raise_post_request(request_uri, body)

    return request_response.json()

def create_steps(steps: List) -> Dict:
    """
    Creates new test steps from the supplied models. The result associated with the step must exist prior to step creation. The server automatically generates step ids if not supplied.
    :param steps: Steps which needs to be created
    :return: json response after creating steps
    """
    if len(steps) == 0 :
        raise ValueError("Number of steps needs to be created can not be empty")
    body = test_step_create_or_update_request_object(
            steps, update_result_total_time=True
        )
    request_uri = base_uri + create_steps_route
    request_response = raise_post_request(request_uri, body)

    return request_response.json()

def update_steps(steps: List) -> Dict:
    """
    Updates existing steps by merging or replacing values.
    :param steps: Steps which needs to be updated
    :return: json response after updating the steps
    """
    if len(steps) == 0 :
        raise ValueError("Number of steps needs to be updated can not be empty")
    body = test_step_create_or_update_request_object(
                steps, update_result_total_time=True
            )
    request_uri = base_uri + update_steps_route
    request_response = raise_post_request(request_uri, body)

    return request_response.json()

def raise_post_request(uri: str, body: Dict) -> requests.Response:
    """
    Makes the post request API call.
    :param uri: request uri which needs to be called
    :param body: API call body
    :return: response of the api call
    """
    request_response =  requests.post(uri, json=body, headers=headers)
    request_response.raise_for_status()

    return request_response