"""Unit tests for the Simulator class."""

import sys
from io import StringIO
from unittest.mock import Mock, patch

from nisystemlink_demo.testdata.simulator import Simulator


class TestSimulator:
    """Test cases for the Simulator class."""

    def test_init(self):
        """Test that Simulator initializes correctly with clients."""
        with patch(
            "nisystemlink_demo.testdata.simulator.TestMonitorClient"
        ) as mock_tm_client, patch(
            "nisystemlink_demo.testdata.simulator.ProductClient"
        ) as mock_product_client:

            simulator = Simulator()

            # Verify that clients were instantiated
            mock_tm_client.assert_called_once()
            mock_product_client.assert_called_once()

            # Verify that the simulator has the expected attributes
            assert hasattr(simulator, "test_monitor_client")
            assert hasattr(simulator, "product_client")

    def test_simulate_sequence_prints_all_parameters(self):
        """Test that simulate_sequence prints all provided parameters."""
        with patch("nisystemlink_demo.testdata.simulator.TestMonitorClient"), patch(
            "nisystemlink_demo.testdata.simulator.ProductClient"
        ):

            simulator = Simulator()

            # Capture stdout
            captured_output = StringIO()
            sys.stdout = captured_output

            try:
                # Test parameters
                part_number = "PN123456"
                serial_number = "SN789012"
                test_plan_id = "TP001"
                system_id = "SYS001"
                test_program = "TestProgram_v1.0"
                operator = "test_operator"
                hostname = "test-machine"

                simulator.simulate_sequence(
                    part_number=part_number,
                    serial_number=serial_number,
                    test_plan_id=test_plan_id,
                    system_id=system_id,
                    test_program=test_program,
                    operator=operator,
                    hostname=hostname,
                )

                output = captured_output.getvalue()

                # Verify all parameters are printed
                assert f"part_number: {part_number}" in output
                assert f"serial_number: {serial_number}" in output
                assert f"test_plan_id: {test_plan_id}" in output
                assert f"system_id: {system_id}" in output
                assert f"test_program: {test_program}" in output
                assert f"operator: {operator}" in output
                assert f"hostname: {hostname}" in output

            finally:
                # Restore stdout
                sys.stdout = sys.__stdout__

    def test_simulate_sequence_with_empty_strings(self):
        """Test that simulate_sequence handles empty string parameters."""
        with patch("nisystemlink_demo.testdata.simulator.TestMonitorClient"), patch(
            "nisystemlink_demo.testdata.simulator.ProductClient"
        ):

            simulator = Simulator()

            # Capture stdout
            captured_output = StringIO()
            sys.stdout = captured_output

            try:
                simulator.simulate_sequence(
                    part_number="",
                    serial_number="",
                    test_plan_id="",
                    system_id="",
                    test_program="",
                    operator="",
                    hostname="",
                )

                output = captured_output.getvalue()

                # Verify empty parameters are handled
                assert "part_number: " in output
                assert "serial_number: " in output
                assert "test_plan_id: " in output
                assert "system_id: " in output
                assert "test_program: " in output
                assert "operator: " in output
                assert "hostname: " in output

            finally:
                # Restore stdout
                sys.stdout = sys.__stdout__

    def test_simulate_sequence_with_special_characters(self):
        """Test that simulate_sequence handles parameters with special characters."""
        with patch("nisystemlink_demo.testdata.simulator.TestMonitorClient"), patch(
            "nisystemlink_demo.testdata.simulator.ProductClient"
        ):

            simulator = Simulator()

            # Capture stdout
            captured_output = StringIO()
            sys.stdout = captured_output

            try:
                # Test parameters with special characters
                part_number = "PN-123@456#"
                serial_number = "SN_789$012%"
                test_plan_id = "TP&001*"
                system_id = "SYS(001)"
                test_program = "Test Program v1.0!"
                operator = "test.operator+user"
                hostname = "test-machine.domain.com"

                simulator.simulate_sequence(
                    part_number=part_number,
                    serial_number=serial_number,
                    test_plan_id=test_plan_id,
                    system_id=system_id,
                    test_program=test_program,
                    operator=operator,
                    hostname=hostname,
                )

                output = captured_output.getvalue()

                # Verify special characters are handled correctly
                assert f"part_number: {part_number}" in output
                assert f"serial_number: {serial_number}" in output
                assert f"test_plan_id: {test_plan_id}" in output
                assert f"system_id: {system_id}" in output
                assert f"test_program: {test_program}" in output
                assert f"operator: {operator}" in output
                assert f"hostname: {hostname}" in output

            finally:
                # Restore stdout
                sys.stdout = sys.__stdout__

    def test_simulate_sequence_parameter_order(self):
        """Test that simulate_sequence prints parameters in the expected order."""
        with patch("nisystemlink_demo.testdata.simulator.TestMonitorClient"), patch(
            "nisystemlink_demo.testdata.simulator.ProductClient"
        ):

            simulator = Simulator()

            # Capture stdout
            captured_output = StringIO()
            sys.stdout = captured_output

            try:
                simulator.simulate_sequence(
                    part_number="PN123",
                    serial_number="SN456",
                    test_plan_id="TP789",
                    system_id="SYS012",
                    test_program="TestProg",
                    operator="operator1",
                    hostname="host1",
                )

                output_lines = captured_output.getvalue().strip().split("\n")

                # Verify the order of printed parameters
                expected_order = [
                    "part_number: PN123",
                    "serial_number: SN456",
                    "test_plan_id: TP789",
                    "system_id: SYS012",
                    "test_program: TestProg",
                    "operator: operator1",
                    "hostname: host1",
                ]

                assert output_lines == expected_order

            finally:
                # Restore stdout
                sys.stdout = sys.__stdout__

    @patch("nisystemlink_demo.testdata.simulator.ProductClient")
    @patch("nisystemlink_demo.testdata.simulator.TestMonitorClient")
    def test_clients_are_stored_as_instance_variables(
        self, mock_tm_client, mock_product_client
    ):
        """Test that the client instances are properly stored as instance variables."""
        mock_tm_instance = Mock()
        mock_product_instance = Mock()
        mock_tm_client.return_value = mock_tm_instance
        mock_product_client.return_value = mock_product_instance

        simulator = Simulator()

        # Verify that the mock instances are stored correctly
        assert simulator.test_monitor_client is mock_tm_instance
        assert simulator.product_client is mock_product_instance
