# SystemLink Enterprise Examples Development Container
# Python 3.13 + Jupyter + Poetry

FROM mcr.microsoft.com/devcontainers/python:3.13-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    POETRY_VERSION=1.8.4 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1

# Add Poetry to PATH
ENV PATH="$POETRY_HOME/bin:$PATH"

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    poetry --version

# Install additional system dependencies for data science work
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install common Python packages for SystemLink development
RUN pip install --upgrade pip && \
    pip install \
    jupyterlab \
    ipykernel \
    pandas \
    requests \
    httpx \
    python-dotenv \
    click \
    scrapbook \
    papermill

# Create workspace directory
WORKDIR /workspaces/systemlink-enterprise-examples

# Set up Jupyter kernel
RUN python -m ipykernel install --user --name=systemlink-dev --display-name="Python 3.13 (SystemLink)"

# Default command
CMD ["sleep", "infinity"]
