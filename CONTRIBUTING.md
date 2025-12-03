# Contributing to systemlink-enterprise-examples

Contributions to systemlink-enterprise-examples are welcome from all!

systemlink-enterprise-examples is managed via [git](https://git-scm.com), with
the canonical upstream repository hosted on
[GitHub](https://github.com/ni/systemlink-enterprise-examples/).

systemlink-enterprise-examples follows a pull-request model for development. If
you wish to contribute, you will need to create a GitHub account, fork this
project, push a branch with your changes to your project, and then submit a pull
request.

See
[GitHub's official documentation](https://help.github.com/articles/using-pull-requests/)
for more details.

## Development Setup

This project uses [Poetry](https://python-poetry.org/) for dependency management
and includes automated tasks via [Poe](https://poethepoetry.readthedocs.io/).

## Getting Started with Poetry

1. **Install Poetry** if you haven't already:

   ```sh
   # On Windows (PowerShell)
   (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

   # On macOS/Linux
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. **Install project dependencies**:

   ```bash
   poetry install
   ```

3. **Activate the virtual environment**:

   ```bash
   poetry shell
   ```

### Available Poe Tasks

The project includes several automated tasks that you can run using Poetry and
Poethepoetry:

- **`poetry run poe test`** - Run the test suite using pytest
- **`poetry run poe lint`** - Run flake8 linting on the codebase
- **`poetry run poe check`** - Check code formatting with Black (without making
  changes)
- **`poetry run poe format`** - Format code with Black
- **`poetry run poe types`** - Run mypy type checking on the codebase

### Recommended Development Workflow

Before submitting a pull request, ensure your code passes all checks:

```bash
# Format your code
poetry run poe format

# Run linting
poetry run poe lint

# Run type checking
poetry run poe types

# Run tests
poetry run poe test
```

You can also run all checks at once:

```bash
poetry run poe format && poetry run poe lint && poetry run poe types && poetry run poe test
```

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
for automated versioning and changelog generation. When contributing to the
`nisystemlink_demo` package, please format your commit messages according to
this specification.

### Commit Message Format

```md
<type>: <description>

[optional body]

[optional footer(s)]
```

### Common Types and Version Bumps

- **`fix:`** - A bug fix (triggers a **PATCH** version bump: 0.1.0 → 0.1.1)

  ```md
  fix: correct calculation error in test result processing
  ```

- **`feat:`** - A new feature (triggers a **MINOR** version bump: 0.1.0 → 0.2.0)

  ```md
  feat: add support for querying test results by date range
  ```

- **`feat!:`** or **`BREAKING CHANGE:`** - A breaking change (triggers a
  **MAJOR** version bump: 0.1.0 → 1.0.0)

  ```md
  feat!: remove deprecated create_result method

  BREAKING CHANGE: The create_result method has been removed. Use
  create_results_and_steps instead.
  ```

### Other Common Types (no version bump)

- **`docs:`** - Documentation changes only
- **`style:`** - Code style changes (formatting, whitespace, etc.)
- **`refactor:`** - Code refactoring without changing functionality
- **`test:`** - Adding or updating tests
- **`chore:`** - Maintenance tasks, dependency updates, etc.
- **`ci:`** - CI/CD configuration changes

### Examples

```bash
# Patch release (0.1.0 → 0.1.1)
git commit -m "fix: handle empty response from API endpoint"

# Minor release (0.1.0 → 0.2.0)
git commit -m "feat: add batch delete functionality for test results"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat!: redesign simulator API with new parameter structure"
```

**Note:** Only commits that affect the `nisystemlink_demo/` package, tests, or
configuration files will trigger a release.

## Security scanning with Snyk

This repository uses [Snyk](https://snyk.io/) for security scanning to identify
and fix vulnerabilities in code before they reach production. Snyk provides
Static Application Security Testing (SAST) that scans your code for security
issues as you develop.

- **IDE integration**: Install the Snyk extension for
  [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=snyk-security.snyk-vulnerability-scanner)
  or
  [Visual Studio](https://marketplace.visualstudio.com/items?itemName=snyk-security.snyk-vulnerability-scanner-vs-2022)
  to get real-time security feedback while writing code. To suggest the Snyk
  extension to contributors, add `.vscode/extensions.json` or `.vsconfig` files
  to your project root. The VSCode Snyk extension has a richer feature set and
  is the preferred IDE for working with Snyk.
- **Pull request scanning**: Snyk automatically scans PRs and posts comments for
  high/critical vulnerabilities.
- **Post-merge monitoring**: Automated bugs are created for unresolved issues
  after code is merged.

**Contributors within NI/Emerson**: For detailed guidance on working with Snyk,
including how to address security issues and create ignore records, see the
[Snyk reference](https://dev.azure.com/ni/DevCentral/_wiki/wikis/Stratus/146862/Snyk-reference).

**Contributors outside of NI/Emerson**: If you are having issues resolving a
vulnerability Snyk identifies on your PR, consult with a code owner to
understand your options for resolution.

## Developer Certificate of Origin (DCO)

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I have the right
to submit it under the open source license indicated in the file; or

(b) The contribution is based upon previous work that, to the best of my
knowledge, is covered under an appropriate open source license and I have the
right under that license to submit that work with modifications, whether created
in whole or in part by me, under the same open source license (unless I am
permitted to submit under a different license), as indicated in the file; or

(c) The contribution was provided directly to me by some other person who
certified (a), (b) or (c) and I have not modified it.

(d) I understand and agree that this project and the contribution are public and
that a record of the contribution (including all personal information I submit
with it, including my sign-off) is maintained indefinitely and may be
redistributed consistent with this project or the open source license(s)
involved.

(taken from [developercertificate.org](https://developercertificate.org/))

See [LICENSE](https://github.com/ni/<reponame>/blob/master/LICENSE) for details
about how systemlink-enterprise-examples is licensed.
