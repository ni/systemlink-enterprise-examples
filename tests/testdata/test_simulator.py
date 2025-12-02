"""Unit tests for the Simulator class."""

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
