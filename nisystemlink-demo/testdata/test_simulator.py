from nisystemlink.clients.product._product_client import ProductClient
from nisystemlink.clients.testmonitor._test_monitor_client import TestMonitorClient


class TestSimulator:
    def __init__(self):
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
        print(f"part_number: {part_number}")
        print(f"serial_number: {serial_number}")
        print(f"test_plan_id: {test_plan_id}")
        print(f"system_id: {system_id}")
        print(f"test_program: {test_program}")
        print(f"operator: {operator}")
        print(f"hostname: {hostname}")
