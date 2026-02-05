#!/bin/bash
# Post-create script for SystemLink Enterprise Examples devcontainer

set -e

echo "🚀 Setting up SystemLink Enterprise Examples development environment..."

# Install Poetry dependencies if pyproject.toml exists
if [ -f "pyproject.toml" ]; then
    echo "📦 Installing Poetry dependencies..."
    poetry install --no-interaction
fi

# Install Jupyter and related tools
echo "📓 Setting up Jupyter environment..."
pip install --quiet jupyterlab ipykernel papermill scrapbook

# Set up the Python kernel for Jupyter
python -m ipykernel install --user --name=systemlink-dev --display-name="Python 3.13 (SystemLink)"

# Create .env from template if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📝 Creating .env file from template..."
    echo "⚠️  Remember to update .env with your actual SystemLink credentials!"
    cp .env.example .env
fi

# Ensure .env is in .gitignore
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.env$" .gitignore; then
        echo "" >> .gitignore
        echo "# Local environment variables - DO NOT COMMIT" >> .gitignore
        echo ".env" >> .gitignore
        echo "📝 Added .env to .gitignore"
    fi
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Quick Start:"
echo "   1. Update .env with your SystemLink credentials"
echo "   2. Run 'poetry install' to ensure all dependencies are installed"
echo "   3. Start coding!"
echo ""
echo "🔗 Useful commands:"
echo "   poetry run poe test     - Run tests"
echo "   poetry run poe lint     - Run linting"
echo "   poetry run poe format   - Format code"
echo "   jupyter lab             - Start Jupyter Lab"
echo ""
