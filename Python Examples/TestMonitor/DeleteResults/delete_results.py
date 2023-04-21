"""
SystemLink Enterprise TestMonitor delete results example

This example creates a single test result and 
deletes this created result by using delete result API and 
creates multiple(five) test results and 
deletes all these multiple results at once by using delete-results API.
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
        raise Exception("Error occurred while creating new test result, please check for correct test result details and have correct access for creating the new test results")
    test_result = response["results"][0]

    return test_result


def delete_single_result(result_id: str) -> None:
    try:
        test_data_manager_client.delete_result(result_id, True)
        print(f"\nThe test result with Id = {result_id} has been deleted")
    except:
        print("Error occurred while deleting the test result, please check for the correct result Id and you have correct access for deleting the results")


def create_and_delete_single_result() -> None:
    
    # create test result
    print("Creating New test result")
    test_result = create_single_result()    
    print(f"Test result has been created under part number={test_result['partNumber']} with Id = {test_result['id']}")
    
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
            print("Error occurred while creating new test result, please check for correct test result details and have correct access for creating the new test results")
        else:
            test_result = response["results"][0]
            result_ids.append(test_result["id"])
            print(f"{test_result['id']}")
    if len(result_ids) > 0 :
        return result_ids
    else:
        raise Exception("Error occurred while creating multiple new test results, please check whether you have correct access for creating the new test results")


def delete_multiple_results(result_ids: List) -> None:
    response = test_data_manager_client.delete_results(result_ids, True)
    if is_partial_success_response(response) :
        print("Error occurred while deleting the multiple test results, please check for the correct result Ids and you have correct access for deleting the results")
    else:
        print("\nMultiple results has been deleted successfully")


def create_and_delete_multiple_results() -> None:

    # create multiple test results
    print("\nCreating multiple test results.\nResult Ids are listed down below")    
    result_ids = create_multiple_results()    
    print("\nMultiple test results has been created successfully")

    # Delete multiple test results
    print("Please enter to delete these results")
    input()
    delete_multiple_results(result_ids)

@click.command()
@click.option("--server", help = "Enter server url")
@click.argument("api_key")
def main(server, api_key):
    """
    To run the example against a SystemLink Enterprise, the URL should include
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
        print("The given URL or API key might be invalid or the server might be down. Please try again after verifying the server is up and the URL or API key is valid")
        print("For more information on how to generate API key, please refer to the documentation provided.")
        print("Try 'delete_results.py --help' for help.")

if __name__ == "__main__":
    main()