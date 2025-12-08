"""Unit tests for the Simulator class."""

from nisystemlink_examples.testdata.simulator import Simulator


class TestSimulator:
    """Test cases for the Simulator class."""

    def test_simulate_sequence_returns_hello_world(self):
        """Test that simulate_sequence returns 'Hello World'."""
        simulator = Simulator()
        result = simulator.simulate_sequence(
            part_number="PN-12345",
            serial_number="SN-67890",
            test_plan_id="TP-001",
            system_id="SYS-001",
            test_program="test_program.py",
            operator="test_operator",
            hostname="test-machine",
        )
        assert result == "Hello World"
