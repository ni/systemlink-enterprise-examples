# SystemLink Dashboard Examples

This folder contains ready-to-use dashboard examples for SystemLink. Each
example demonstrates best practices for visualizing and monitoring your test,
measurement, and operations data.

## Getting Started

Dashboard examples are designed to help you quickly visualize data in your
SystemLink instance. Each example includes everything you need to get started,
including the dashboard JSON file, any supporting notebooks for data generation,
and comprehensive setup instructions.

### What's Included in Each Example

Every dashboard example contains:

1. **Dashboard JSON File** - A pre-configured dashboard that you can import
   directly into SystemLink
2. **Supporting Jupyter Notebooks** (if needed) - Automated scripts for data
   preparation, ETL operations, or scheduled updates
3. **README Documentation** - Step-by-step setup instructions and feature
   descriptions

## How to Use These Examples

### Prerequisites

- SystemLink instance with access to Dashboards
- Appropriate permissions to import dashboards, run notebooks, and setup
  routines (if applicable)

### Basic Installation Steps

While each example has specific instructions, the general process is:

1. **Review the Example README** - Check prerequisites and understand what data
   sources are needed
2. **Import the Dashboard** - Navigate to **Overview → Dashboards → New →
   Import** in SystemLink and upload the JSON file. Select the appropriate
   workspace and update the UUID if needed.
3. **Configure Settings** - Adjust dashboard variables, time ranges, and data
   sources as needed
4. **Start Monitoring** - Your dashboard is ready to use!

## Available Dashboard Examples

Browse the examples below to find dashboards that match your use case. Each
example includes detailed documentation on setup and usage.

<!-- Dashboard examples list - add new examples below -->

### Example Dashboards

> **Note:** This section will be populated as dashboard examples are added to
> the repository. Each entry will include a brief description and link to the
> example folder.

<!--
Template for adding new examples:

### [Dashboard Name](./Example-Folder-Name/)
Brief 1-2 sentence description of what this dashboard does and its primary use case.

**Key Features:**
- Feature 1
- Feature 2
- Feature 3
-->

---

## Understanding Dashboard Components

### Dashboard JSON Files

The JSON files in these examples contain the complete dashboard configuration,
including:

- Panel layouts and visualizations
- Query definitions for data sources
- Dashboard variables and filters
- Time range settings
- Styling and theming

### Supporting Notebooks

Some dashboards require Jupyter notebooks to:

- Generate sample or test data
- Perform ETL (Extract, Transform, Load) operations
- Schedule automated data updates
- Pre-process data for visualization

These notebooks are typically set up as SystemLink routines that run on a
schedule to keep your dashboard data current.

### Configuration and Customization

After importing a dashboard, you may want to:

- **Adjust Time Ranges** - Set default time windows that make sense for your
  data
- **Configure Variables** - Dashboard variables allow you to filter data
  dynamically
- **Modify Refresh Intervals** - Control how often the dashboard updates
- **Customize Visualizations** - Adapt colors, thresholds, and display options
  to your needs
- **Set Permissions** - Control who can view or edit the dashboard

## Getting Help

If you encounter issues:

1. Check the specific example's README for troubleshooting tips
2. Review the [main repository documentation](../../README.md)
3. Open an issue on the GitHub repository with details about your problem

## Contributing

Want to share your own dashboard example? See
[CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on creating and submitting
dashboard examples.

## Additional Resources

- [SystemLink Enterprise Documentation](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/)
- [Main Examples Repository](../../README.md)

---

**Questions or feedback?** Open an issue or contribute to the repository!
