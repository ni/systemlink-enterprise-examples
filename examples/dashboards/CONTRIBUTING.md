# Contributing Dashboard Examples

This guide outlines the structure and requirements for contributing dashboard
examples to the SystemLink Enterprise examples repository.

## Dashboard Example Structure

Each dashboard example should be organized in its own subdirectory within the
`examples/dashboards/` folder. The structure of each example should follow this
pattern:

```
examples/dashboards/<Example-Name>/
├── <dashboard-name>.json          # The dashboard JSON file
├── *.ipynb                         # Any supporting Jupyter notebooks
└── README.md                       # Documentation for the example
```

## Required Components

### 1. Dashboard JSON File

Each example **must** include a single `.json` file that contains the dashboard
definition.

**Requirements:**

- The file should be able to import directly into SystemLink Dashboards
- Use a descriptive filename that reflects the dashboard's purpose
- Only one dashboard JSON file per example
- Ensure the JSON is properly formatted and validated

**Example:** `production-monitoring-dashboard.json`

### 2. Supporting Jupyter Notebooks

Include any Jupyter notebooks (`.ipynb` files) required to support the dashboard
functionality.

**Requirements:**

- Use clear, descriptive filenames
- Include inline documentation and markdown cells explaining each step
- Ensure notebooks are executable from top to bottom without errors
- Document any required dependencies in the example's README

### 3. README Documentation

Each example **must** include a comprehensive `README.md` file.

**Required sections:**

#### Overview

- Brief description of the dashboard and its purpose
- Target use case or audience
- Key features and capabilities

#### Prerequisites

- Required SystemLink version
- Any required permissions or access levels
- External dependencies or Python packages
- Data sources that need to be available

#### Setup Instructions

Provide step-by-step instructions for setting up the example. This should
include:

1. **Data Preparation** (if applicable)

   - Instructions for running any supporting notebooks
   - Data generation or import steps
   - Configuration of data sources

2. **Routine/Notebook Setup** (if applicable)

   - Instructions on how to upload and publish the notebook including any
     interfaces that need to be used.
   - How to schedule or configure automated routines
   - Notebook execution frequency and triggers
   - Environment setup requirements

3. **Dashboard Installation**

   - How to import the dashboard JSON into SystemLink
   - Navigation path: Overview → Dashboards → New → Import

4. **Configuration and Customization**
   - Dashboard variables that need to be set
   - Time range recommendations
   - Refresh interval settings
   - Any post-installation configuration steps

#### Dashboard Features

Describe how the dashboard works and what it displays:

- **Visualization Overview**: Describe the main panels and visualizations
- **Key Metrics**: Explain what metrics are being tracked
- **Interactive Features**: Document any dashboard variables, filters, or
  drill-down capabilities
- **Data Flow**: Explain how data flows from source to visualization
- **Use Cases**: Provide examples of how to use the dashboard effectively

#### Troubleshooting

Include common issues and their solutions:

- Data not appearing
- Permission errors
- Missing dependencies
- Common configuration mistakes

## Updating the Main Dashboards README

When contributing a new dashboard example, you **must** update the main
[README.md](./README.md) file in the `examples/dashboards/` folder to include
your example in the **Available Dashboard Examples** section.

### Adding Your Example to the README

1. Open `examples/dashboards/README.md`
2. Locate the **Available Dashboard Examples** section
3. Add your example using the following template:

```markdown
### [Your Dashboard Name](./Your-Example-Folder/)

Brief 1-2 sentence description of what this dashboard does and its primary use
case.

**Key Features:**

- Feature 1
- Feature 2
- Feature 3
```

### Guidelines for the README Entry

- **Dashboard Name**: Use the same name as your example folder
- **Link**: Ensure the relative path points to your example folder
- **Description**: Keep it concise (1-2 sentences) and focus on the value
  proposition
- **Key Features**: List 3-5 of the most important features or capabilities
- **Order**: Add new examples alphabetically or at the end of the list

### Example Entry

```markdown
### [Production Line Monitoring](./Production-Line-Monitoring/)

Real-time monitoring dashboard for manufacturing production lines, tracking
throughput, quality metrics, and equipment status.

**Key Features:**

- Live production rate visualization with historical trends
- Quality defect tracking and Pareto analysis
- Equipment utilization and downtime monitoring
- Customizable alerts for production anomalies
- Multi-line comparison views
```

## Submission Checklist

Before submitting your dashboard example, verify:

- [ ] Dashboard JSON file is included and properly formatted
- [ ] All supporting Jupyter notebooks are included
- [ ] README.md is complete with all required sections
- [ ] Setup instructions have been tested and work correctly
- [ ] All dependencies are documented
- [ ] Dashboard variables and settings are documented
- [ ] Example follows the naming conventions
- [ ] Code is well-commented and readable
- [ ] No sensitive information (credentials, URLs, etc.) is included
- [ ] No environment-specific information (`workspaceId`, `productID`, etc.) is
      included
- [ ] Main dashboards README.md has been updated with your example summary

## Submitting Your Pull Request

When you're ready to submit your dashboard example, use the dashboard-specific
pull request template to ensure all required information is included.

### Using the Dashboard PR Template

#### Option 1: Direct Link

Use this link to create a pull request with the dashboard template pre-loaded:

```text
https://github.com/ni/systemlink-enterprise-examples/compare?template=dashboard_example.md
```

Replace `ni/systemlink-enterprise-examples` with the appropriate repository path
if contributing to a fork.

#### Option 2: Manual Selection

1. Create your pull request as usual
2. When the PR description editor appears, look for the template picker
3. Select `dashboard_example.md` from the available templates

The template includes the submission checklist and guides you through providing
all necessary information about your dashboard contribution.

## Review Process

All contributions will be reviewed for:

- Completeness of documentation
- Functionality and correctness
- Code quality and style
- Adherence to this structure guide
- Value to the community
