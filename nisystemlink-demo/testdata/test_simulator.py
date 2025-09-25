"""This module provides a `TestSimulator` class for simulating test sequences in SystemLink.

Classes:
    TestSimulator: Simulates test sequences by printing provided test parameters.
"""

from nisystemlink.clients.product._product_client import ProductClient
from nisystemlink.clients.testmonitor._test_monitor_client import TestMonitorClient


class TestSimulator:
    """Simulates test sequences based on a test plan for a product using its specifications."""

    def __init__(self):
        """Initializes the TestSimulator."""
        self.test_monitor_client = TestMonitorClient()
        self.product_client = ProductClient()

    def simulate_sequence(
        self,
        part_number: str,
        serial_number: str,
        test_plan_id: str,
        system_id: str,
        test_program: str,
        operator: str,
        hostname: str,
    ):
        """Simulates a test sequence."""
        print(f"part_number: {part_number}")
        print(f"serial_number: {serial_number}")
        print(f"test_plan_id: {test_plan_id}")
        print(f"system_id: {system_id}")
        print(f"test_program: {test_program}")
        print(f"operator: {operator}")
        print(f"hostname: {hostname}")
