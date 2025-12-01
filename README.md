# SystemLink Enterprise Examples

Welcome to the SystemLink Enterprise examples repository! This collection
provides practical, ready-to-use code examples demonstrating how to work with
the SystemLink Enterprise APIs and automation capabilities.

## Overview

[SystemLink](https://www.ni.com/systemlink) is NI's comprehensive test data
management and analytics platform. This repository contains examples across
multiple programming languages and use cases to help you integrate, automate,
and extend SystemLink Enterprise for your organization's needs.

## What's Included

### 📊 API Integration Examples

- **[.NET Examples](examples/DotNet%20Examples/)** - C# examples for integrating
  with SystemLink APIs
  - Test Monitor API: Create and manage test results and steps
  - Delete operations and data management
- **[Python Examples](examples/Python%20Examples/)** - Python scripts for
  programmatic access
  - Test Monitor API: Publish and manage test results
  - Automated data operations

### 📓 Jupyter Notebook Examples

- **[Script Analysis Examples](examples/Script%20Analysis%20Examples/)** -
  Analyze and visualize your test data
  - Data Space Analysis: Explore and understand your data spaces
  - Specification Analysis: Analyze test specifications and limits
  - Test Data Analysis: Perform failure Pareto analysis and result trending
- **[Simple ETL Example](examples/Simple%20ETL%20Example/)** - Data extraction
  and normalization
  - Extract data from files stored in SystemLink
  - Transform and normalize data for ingestion
  - Load data into the SystemLink Dataframe Service
- **[Test Plan Automations](examples/Test%20Plan%20Automations%20Examples/)** -
  Automate test plan operations
  - Update test plans with templates
- **[Test Plan Scheduler](examples/Test%20Plan%20Scheduler%20Examples/)** -
  Automated scheduling
  - Auto-schedule test plans based on your requirements

### ⚙️ Configuration Examples

- **[Dynamic Form Fields](examples/Dynamic%20Form%20Fields%20Configuration%20Examples/)** -
  Customize the UI
  - Add custom fields to work orders, test plans, products, assets, and systems
  - Configure field types, groups, and display rules
- **[Test Plan Operations](examples/Test%20Plan%20Operations%20Examples/)** -
  Customize workflows
  - Create test plan templates for standardization
  - Define custom workflows with specialized states and actions

## Getting Started

### Prerequisites

Depending on which examples you want to run, you'll need:

- **For .NET Examples**:
  [.NET Core SDK](https://dotnet.microsoft.com/download/dotnet-core)
- **For Python Examples**: [Python 3.8+](https://www.python.org/downloads/)
- **For Jupyter Notebooks**: [Jupyter](https://jupyter.org/install) or use
  SystemLink's built-in notebook capability

### Quick Start

1. **Clone this repository**

   ```bash
   git clone https://github.com/ni/systemlink-enterprise-examples.git
   cd systemlink-enterprise-examples
   ```

2. **Navigate to the example you want to run**

   ```bash
   cd examples/<example-category>/<specific-example>
   ```

3. **Follow the README in that example's directory** for specific setup and
   execution instructions

Each example directory contains its own README with detailed instructions
tailored to that specific example.

## Example Categories Explained

### When to Use Each Type

- **API Integration (.NET/Python)** - When you need to:
  - Integrate SystemLink with other systems
  - Automate data publishing from test stations
  - Build custom applications that interact with SystemLink
- **Jupyter Notebooks** - When you need to:
  - Perform ad-hoc data analysis
  - Create automated reporting dashboards
  - Set up recurring data processing routines
  - Visualize test trends and patterns
- **Configuration Examples** - When you need to:
  - Customize the SystemLink user interface
  - Standardize test plan creation
  - Implement custom workflows for your processes

## Documentation

- [SystemLink Enterprise Documentation](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/)
- [Creating an API Key](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/page/creating-an-api-key.html)

## Support

For questions about SystemLink Enterprise or these examples:

- Visit the [NI Community Forums](https://forums.ni.com/)
- Contact [NI Support](https://www.ni.com/en-us/support.html)

---

**Note**: These examples are provided as-is for educational and demonstration
purposes. Always test thoroughly in a non-production environment before
deploying to production systems.
