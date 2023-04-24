"""
SystemLink Enterprise TestMonitor delete results example

This example has two sections.
The example in the first section creates a single test result and 
deletes the created result by using delete result API.
The example in the second section creates multiple(five) test results and 
deletes all the created results at once using the delete-results API.
"""

import uuid
import sys
import os
import datetime
from typing import Dict, List
import click

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)

import test_data_manager_client

def get_test_result() -> Dict:
    test_result = {
        "programName": "Power Test",
        "status": {
            "statusType": "RUNNING",
            "statusName": "Running"
        },
        "systemId": None,
        "hostName": None,
        "properties":None,
        "serialNumber": str(uuid.uuid4()),
        "operator": "John Smith",
        "partNumber": "NI-ABC-123-PWR1",
        "fileIds":None,
        "startedAt": str(datetime.datetime.utcnow()),
        "totalTimeInSeconds": 0.0
    }

    return test_result


def is_partial_success_response(response: Dict) -> bool:
    return "error" in response.keys()


def create_single_result() -> Dict:
    test_result = get_test_result()

    # create test result
    response = test_data_manager_client.create_results(results=[test_result])
    if is_partial_success_response(response):
        raise Exception("Error occurred while creating a new test result. Please check if you have provided the correct test result details and if you have the right access for creating the new test result.")
    test_result = response["results"][0]

    return test_result


def delete_single_result(result_id: str) -> None:
    try:
        test_data_manager_client.delete_result(result_id, True)
        print(f"\nThe test result with ID = {result_id} has been deleted successfully")
    except:
        print("Error occurred while deleting the test result. Please check if you have provided the correct result ID and if you have the right access for deleting the test result.")


def create_and_delete_single_result() -> None:
    
    # create test result
    print("Creating New test result")
    test_result = create_single_result()    
    print(f"Test result has been created under part number={test_result['partNumber']} with ID = {test_result['id']}")
    
    # delete test result
    print("Press enter to delete the result")
    input()
    delete_single_result(test_result["id"])


def create_multiple_results() -> List:
    test_result = get_test_result()
    program_name = test_result["programName"]
    result_ids = []
    for i in range(0,5):
        test_result["programName"] = program_name + str(i)
        response = test_data_manager_client.create_results(results=[test_result])
        if is_partial_success_response(response):
            print("Error occurred while creating a new test result. Please check if you have provided the correct test result details and if you have the right access for creating the new test results")
        else:
            test_result = response["results"][0]
            result_ids.append(test_result["id"])
            print(f"{test_result['id']}")
    if len(result_ids) > 0 :
        return result_ids
    else:
        raise Exception("Error occurred while creating multiple new test results. Please check if you have the right access for creating test results.")


def delete_multiple_results(result_ids: List) -> None:
    response = test_data_manager_client.delete_results(result_ids, True)
    if is_partial_success_response(response) :
        print("Error occurred while deleting the test results. Please check if you have provided the correct result IDs and if you have the right access for deleting the test results.")
    else:
        print("\nMultiple test results have been deleted successfully.")


def create_and_delete_multiple_results() -> None:

    # create multiple test results
    print("\nCreating multiple test results.\nResult IDs are listed below:")    
    result_ids = create_multiple_results()    
    print("\nMultiple test results have been created successfully.")

    # Delete multiple test results
    print("Press enter to delete these results.")
    input()
    delete_multiple_results(result_ids)

@click.command()
@click.option("--server", help = "Enter server URL.")
@click.argument("api_key")
def main(server, api_key):
    """
    To run the example against SystemLink Enterprise, the URL should include
    the scheme, host, and port if not default.\n
    For example:\n
    python delete_results.py --server https://myserver:9091 api_key.\n

    For more information on how to generate API key, please refer to the documentation provided.
    """

    test_data_manager_client.set_base_url_and_api_key(server, api_key)

    try:
        # Creating single test result and deleting it
        create_and_delete_single_result()

        # Creating multiple test result and deleting them all at once
        create_and_delete_multiple_results()        
        
    except Exception as e:
        print(e)
        print("The given URL or API key might be invalid or the server might be down. Please try again after verifying the following: server is up, correct URL and API key.")
        print("For more information on how to generate API key, please refer to the documentation provided.")
        print("Try running the 'delete_results.py --help' command for help.")

if __name__ == "__main__":
    main()