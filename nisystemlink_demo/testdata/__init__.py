"""TestData utilities for SystemLink Enterprise demo package.

This module provides utilities for generating test data and simulating test execution
scenarios for SystemLink Enterprise integrations.
"""

from .simulator import Simulator
from .testplan_data_generator import simulate_spec_test_for_test_plan

__all__ = [
    "Simulator",
    "simulate_spec_test_for_test_plan",
]
