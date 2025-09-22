# SystemLink Enterprise Examples

This repository serves two primary purposes for SystemLink Enterprise: demos and
integration examples.

## Python Demo Library

The `nisystemlink-demo/` folder contains a Python library with useful demo code
and utilities for SystemLink Enterprise integrations. This library provides:

- Reusable code components for common SystemLink operations
- Test data generators and utilities
- Example implementations of best practices
- Helper functions for SystemLink Enterprise workflows

### Installation

This repository is set up as a Poetry project. To use the Python library:

```bash
# Clone the repository
git clone <repository-url>
cd systemlink-enterprise-examples

# Install with Poetry
poetry install

# Activate the environment
poetry shell

# Use the demo library
python -c "import nisystemlink_demo"
```

## Integration Examples

The `examples/` folder contains standalone examples that serve as starting
points for your own SystemLink Enterprise integrations. These examples
demonstrate:

- Common integration patterns
- API usage examples
- Real-world implementation scenarios
- Best practices for different use cases

Each example in the `examples/` folder is designed to be:

- **Self-contained**: Can be copied and used independently
- **Well-documented**: Includes clear instructions and explanations
- **Production-ready**: Follows best practices and includes error handling
- **Customizable**: Easy to modify for your specific requirements

## Development

This project uses:

- **Poetry** for dependency management
- **Flake8** for code quality (Google docstring style, Smarkets import order)
- **nisystemlink-clients** for SystemLink Enterprise API integration

### Code Quality

Run code quality checks:

```powershell
poetry run flake8 nisystemlink-demo/
poetry run flake8 examples/
```

## Contributing

When adding new content:

- **Demo library code** goes in `nisystemlink-demo/`
- **Example integrations** go in `examples/`
- Follow the established code quality standards
- Include clear documentation and comments
