"""Data Generator (simulation) for SystemLink Test Plans."""

import random

import requests

from .test_simulator import TestSimulator


def __get_random_name() -> str:
    """Returns a random name from a list of famous technologists and scientists."""
    names = [
        "Ada Lovelace",
        "Alan Turing",
        "Grace Hopper",
        "Nikola Tesla",
        "Marie Curie",
        "Albert Einstein",
        "Katherine Johnson",
        "Carl Sagan",
        "Tim Berners-Lee",
        "Rosalind Franklin",
    ]
    return random.choice(names)


def __get_system_alias(system_id, sl_uri, headers):
    """Returns the system alias for a given system ID."""
    if not system_id:
        raise ValueError(
            "No system has been selected for this test plan. Please pick a system."
        )
    get_system_resp = requests.get(
        f"{sl_uri}/nisysmgmt/v1/systems?id={system_id}", headers=headers
    )
    get_system_resp.raise_for_status()
    system_details = get_system_resp.json()
    hostname = system_details[0]["alias"]
    return hostname


def __get_dut_serial_number(sl_uri, headers, dut_id) -> str:
    if not dut_id:
        raise ValueError(
            "No DUT has been selected for this test plan. Please pick a DUT."
        )

    get_dut_resp = requests.get(f"{sl_uri}/niapm/v1/assets/{dut_id}", headers=headers)
    get_dut_resp.raise_for_status()
    serial_number = get_dut_resp.json()["serialNumber"]
    return serial_number


def simulate_spec_test_for_test_plan(
    test_plan_id: str, api_key: str, sl_uri: str
) -> None:
    """Simulates a test for all conditions combinations for all specs for the product associated with the test plan.

    This function retrieves test plan details from the SystemLink server, gathers required
    information such as system ID, test program, part number, DUT ID, operator, and hostname alias,
    and then simulates a test sequence using the TestSimulator.

    Args:
        test_plan_id (str): The unique identifier of the test plan to simulate.
        api_key (str): The API key used for authenticating requests to the SystemLink server.
        sl_uri (str): The base URI of the SystemLink server.

    Raises:
        ValueError: If no system is selected for the test plan.
        requests.HTTPError: If the request to retrieve the test plan fails.
    """
    headers = {"X-NI-API-KEY": api_key, "Content-Type": "application/json"}
    get_test_plan_response = requests.get(
        f"{sl_uri}/niworkorder/v1/testplans/{test_plan_id}", headers=headers
    )
    get_test_plan_response.raise_for_status()
    system_id = get_test_plan_response.json()["systemId"]
    test_program = get_test_plan_response.json()["testProgram"]
    part_number = get_test_plan_response.json()["partNumber"]
    dut_id = get_test_plan_response.json()["dutId"]
    operator = __get_random_name()
    hostname_alias = __get_system_alias(system_id, sl_uri, headers)
    if not system_id:
        raise ValueError(
            "No system has been selected for this test plan. Please pick a system."
        )

    serial_number = __get_dut_serial_number(sl_uri, headers, dut_id)
    tm_simulator = TestSimulator()
    tm_simulator.simulate_sequence(
        part_number=part_number,
        serial_number=serial_number,
        test_plan_id=test_plan_id,
        system_id=system_id,
        test_program=test_program,
        operator=operator,
        hostname=hostname_alias,
    )
