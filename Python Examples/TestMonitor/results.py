"""
SystemLink Test Monitor results example

This is an example of uploading test results to the SystemLink Test Monitor service.
It simulates measuring the power output from a device and tests the measured power
to ensure it is within a specified upper and lower limit.  The power is simulated using
a the simple electrical equation P=VI (power=voltage*current).  In this example, a random
amount of current loss and voltage loss are induced to simulate a non-ideal device.

A top level result is created containing metadata about the overall test.

The example sweeps across a range of input currents and voltages and takes measurements
for each combination and stores a single measurement within each test step.  The test
steps are associated with the test result, and in some cases, as child relationships
to other test steps.  Each step is uploaded to the SystemLink server as it is generated.
At the end, the step status is evaluated to set the status of the parent step and
ultimately sets the status of the top-level test result.
"""

import random
import requests
import uuid
import sys
import asyncio
import datetime
from typing import Any, Tuple, Dict, List

def measure_power(current: float, voltage: float = 0) -> Tuple[float, List[Any], List[Any]]:
    """
    Simulates taking an electrical power measurement.
    This introduces some random current and voltage loss.
    :param current: The electrical current value.
    :param voltage: The electrical voltage value.
    :return: A tuple containing the electrical power measurements and the input and output lists.
    """
    current_loss = 1 - random.uniform(0, 1) * 0.25
    voltage_loss = 1 - random.uniform(0, 1) * 0.25
    power = current * current_loss * voltage * voltage_loss

    # Record electrical current and voltage as inputs.
    inputs = [{"name":"current", "value":current}, {"name":"voltage", "value":voltage}]

    # Record electrical power as an output.
    outputs = [{"name":"power", "value":power}]

    return power, inputs, outputs


def build_power_measurement_params(power: float, low_limit: float, high_limit: float, status: Any) -> Any:
    """
    Builds a Test Monitor measurement parameter object for the power test.
    :param power: The electrical power measurement.
    :param low_limit: The value of the low limit for the test.
    :param high_limit: The value of the high limit for the test.
    :param status: The measurement's pass/fail status.
    :return: A list of test measurement parameters.
    """
    parameter = {
        "name": "Power Test",
        "status": str(status["statusType"]),
        "measurement": str(power),
        "units": "Watts",
        "nominalValue": None,
        "lowLimit": str(low_limit),
        "highLimit": str(high_limit),
        "comparisonType": "GELE"
    }

    parameters = {"text": "", "parameters": [parameter]}
    return parameters


def generate_step_data(
    name: str,
    step_type: str,
    inputs: List[Any] = None,
    outputs: List[Any] = None,
    parameters: Any = None,
    status: Dict = None,
):
    """
    Creates the step data and
    populates it to match the TestStand data model.
    :param name: The test step's name.
    :param step_type: The test step's type.
    :param inputs: The test step's input values.
    :param outputs: The test step's output values.
    :param parameters: The measurement parameters.
    :param status:
    :return: The step data used to create a test step.
    """
    step_status = status if status else {
        "statusType": "RUNNING",
        "statusName": "Running"
        }

    step_data = {
        "stepId": None,
        "parentId": None,
        "resultId": None,
        "children": None,
        "data": parameters,
        "dataModel": "TestStand",
        "name": name,
        "startedAt": None,
        "status": step_status,
        "stepType": step_type,
        "totalTimeInSeconds": random.uniform(0, 1) * 10,
        "inputs": inputs,
        "outputs": outputs
    }

    return step_data


def create_test_result_request(results):
    """
    Creates a create test result request object 
    dictionary required for creating the new test results.
    :param results: List of results that needs to create
    :return: A dictionary which is required for creating the results
    """
    return {
        "results":results
    }


def test_step_create_or_update_request_object(steps, update_result_total_time=True):
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

def update_test_results_request(results, determine_status_from_steps=True):
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

def main():
    
    args = sys.argv

    if len(args) == 3 :
        host =args[1]
        api_key = args[2]
    else:
        print_usage_and_exit("Please pass all the required arguments")

    create_results_host = f"{host}nitestmonitor/v2/results"
    create_steps_host = f"{host}nitestmonitor/v2/steps"
    update_results_host = f"{host}nitestmonitor/v2/update-results"
    update_steps_host = f"{host}nitestmonitor/v2/update-steps"
    headers = { 'X-NI-API-KEY': api_key }

    # Set test limits
    low_limit = 0
    high_limit = 70

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
        "startedAt": str(datetime.datetime.now()),
        "totalTimeInSeconds": 0.0
    }

    create_results_request = create_test_result_request(results=[test_result])
    request_response = requests.post(create_results_host, json=create_results_request, headers=headers)
    create_results_response = request_response.json()
    test_result = create_results_response["results"][0]

    """
    Simulate a sweep across a range of electrical current and voltage.
    For each value, calculate the electrical power (P=IV).
    """
    for current in range(0, 10):
        # Generate a parent step to represent a sweep of voltages at a given current.
        voltage_sweep_step_data = generate_step_data("Voltage Sweep", "SequenceCall")
        voltage_sweep_step_data["resultId"] = test_result["id"]
        # Create the step on the SystemLink server.
        create_steps_request = test_step_create_or_update_request_object(
            steps=[voltage_sweep_step_data], update_result_total_time=True
        )
        request_response = requests.post(create_steps_host, json=create_steps_request, headers=headers)
        create_steps_response = request_response.json()
        voltage_sweep_step = create_steps_response["steps"][0]

        for voltage in range(0, 10):
            # Simulate obtaining a power measurement.
            power, inputs, outputs = measure_power(current, voltage)

            # Test the power measurement.
            if power < low_limit or power > high_limit:
                status = {
                    "statusType": "FAILED",
                    "statusName": "Failed"
                }
            else:
                status = {
                    "statusType": "PASSED",
                    "statusName": "Passed"
                }
            test_parameters = build_power_measurement_params(power, low_limit, high_limit, status)

            # Generate a child step to represent the power output measurement.
            measure_power_output_step_data = generate_step_data(
                "Measure Power Output", "NumericLimit", inputs, outputs, test_parameters, status
            )
            # Create the step on the SystemLink server.
            measure_power_output_step_data["parentId"] = voltage_sweep_step["stepId"]
            measure_power_output_step_data["resultId"] = test_result["id"]
            create_steps_request = test_step_create_or_update_request_object(
                steps=[measure_power_output_step_data], update_result_total_time=True
            )
            request_response = requests.post(create_steps_host, json=create_steps_request, headers=headers)
            create_steps_response = request_response.json()
            measure_power_output_step = create_steps_response["steps"][0]

            # If a test in the sweep fails, the entire sweep failed.  Mark the parent step accordingly.
            if status["statusType"] == "FAILED":
                voltage_sweep_step["status"] = {
                    "statusType": "FAILED",
                    "statusName": "Failed"
                }
                # Update the parent test step's status on the SystemLink server.
                update_steps_request = test_step_create_or_update_request_object(
                    steps=[voltage_sweep_step], update_result_total_time=True
                )
                request_response = requests.post(update_steps_host, json=update_steps_request, headers=headers)
                update_steps_response = request_response.json()
                voltage_sweep_step = update_steps_response["steps"][0]

        # If none of the child steps failed, mark the step as passed.
        if voltage_sweep_step["status"]["statusType"] == "RUNNING":
            voltage_sweep_step["status"] = {
                    "statusType": "PASSED",
                    "statusName": "Passed"
                }
            # Update the test step's status on the SystemLink server.
            update_steps_request = test_step_create_or_update_request_object(
                steps=[voltage_sweep_step], update_result_total_time=True
            )
            request_response = requests.post(update_steps_host, json=update_steps_request, headers=headers)
            update_steps_response = request_response.json()
            voltage_sweep_step = update_steps_response["steps"][0]

    # Update the top-level test result's status based on the most severe child step's status.
    update_result_request = update_test_results_request(results=[test_result], determine_status_from_steps=True)
    request_response = requests.post(update_results_host, json=update_result_request, headers=headers)
    update_results_response = request_response.json()
    test_result = update_results_response["results"][0]
    


if __name__ == "__main__":
    main()