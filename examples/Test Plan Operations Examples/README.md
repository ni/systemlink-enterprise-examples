# Test Plan Operations Example

This example demonstrates how to customize test plan workflows to match your
organization's processes. You can choose from two levels of customization:

1. **Test Plan Templates Only** - Pre-define common test plan fields
2. **Custom Workflows + Templates** - Define custom states, substates, actions,
   and business logic

## When to use test plan templates

Use test plan templates when you need to standardize common test plan properties
(part numbers, test programs, etc.) without changing the core workflow.

## When to create custom workflows

Create custom workflows when you need to:

- Define custom substates that reflect your specific testing process (e.g.,
  "Deploying", "Calibrating", "Warming Up")
- Add state-specific custom action buttons that trigger specific jobs or
  notebooks
- Link to a custom dashboard
- Implement approval processes or multi-stage testing workflows
- Localize substates and actions for international teams

Custom workflows are designed for organizations with specialized testing
processes that require more control over the test plan lifecycle.

## Test plan templates

A test plan template defines default values and behaviors for a specific type of
test. Templates can work with either the default SystemLink workflow or
reference a custom workflow for specialized processes.

Test plan templates can be created using the Work Order API's POST
`/niworkorder/v1/testplan-templates` endpoint. The
[TestPlanTemplate.json](TestPlanTemplate.json) provides an example of a test
plan template that includes execution actions.

**Basic template capabilities:**

- Pre-populate test plan fields (part number, test program, system requirements)
- Set up property replacement for dynamic values

**Template with custom workflow:**

- Reference a custom workflow via `workflowId` to define specialized states and
  actions
- Override specific workflow actions with test-specific implementations
- Inherit all custom substates and business logic from the workflow

## Custom workflows

Custom workflows define the complete lifecycle, states, and available actions
for test plans. They are created separately from templates and can be reused
across multiple test plan templates.

Custom workflows can be created using the Work Order API's POST
`/niworkorder/v1/workflows` endpoint. The
[workflow-template.json](workflow-template.json) file provides a complete
example of a custom workflow definition that includes:

- Custom states and substates for detailed progress tracking
- Multiple action types (manual, job execution, notebook execution, scheduling)
- State transition logic with available actions per substate
- Dashboard integration settings
- Privilege requirements for action execution

### Understanding states and substates

States represent the major phases of your test plan lifecycle, while substates
provide granular status information within each phase. This two-level approach
allows you to:

- **Track detailed progress** - Show specific activities like "Deploying",
  "Calibrating", or "Warming Up" within broader states
- **Provide user-friendly status** - Display meaningful status messages to
  operators and stakeholders
- **Control action availability** - Make specific actions available only during
  appropriate substates

**Required states:** All workflows must include the standard SystemLink states:
`NEW`, `DEFINED`, `REVIEWED`, `SCHEDULED`, `PENDING_APPROVAL`, `CLOSED`, and
`CANCELED`. These ensure compatibility with SystemLink's core functionality.

**Custom substates:** Within each state, you can define multiple substates that
reflect your specific testing process. For example, within the `SCHEDULED`
state, you might have substates like "Scheduled", "Deploying", "Ready", or
"Failed Deployment".

In the Test Plans application, substates appear as the "Status" property, giving
users clear visibility into exactly where each test stands in your process.

### Localizing substates for global teams

If your organization operates across multiple regions, you can localize substate
labels and help text to provide a native language experience for each user.

In a custom workflow, each substate can include a `displayText` and `helpText`
property, as well as an `i18n` array for localization. The `i18n` array allows
you to provide translations for different languages, so the UI will display the
appropriate label and help text based on the user's language settings. If a
translation is not provided for the current language, the UI will fall back to
the default `displayText` and `helpText`.

Example (from a custom workflow):

```json
{
  "name": "SCHEDULED",
  "substates": [
    {
      "name": "SCHEDULED",
      "displayText": "Scheduled",
      "helpText": "The test plan is scheduled for a specific time and assigned to a DUT and test system.",
      "i18n": [
        {
          "localeId": "de",
          "displayText": "Testplan geplant",
          "helpText": "Der Testplan ist für eine bestimmte Zeit geplant und einem DUT und Testsystem zugewiesen."
        },
        {
          "localeId": "en",
          "displayText": "Scheduled",
          "helpText": "The test plan is scheduled for a specific time and assigned to a DUT and test system."
        }
      ]
    }
  ]
}
```

### Defining custom actions

Actions are the buttons that appear in the test plan UI, allowing users to
trigger specific activities at the right moments in your testing process. Each
action can:

- **Execute automation** - Trigger jobs on test systems, run analysis notebooks,
  or integrate with external tools
- **Control workflow progression** - Transition test plans between states and
  substates
- **Provide user guidance** - Show contextually appropriate actions based on
  current test status

**Action types:**

- `JOB` - Execute Systems Management jobs (deployment, calibration, test
  execution)
- `NOTEBOOK` - Run Jupyter notebooks for data analysis or reporting
- `MANUAL` - Simple state transitions without automation (approvals, manual
  checks)
- `SCHEDULE` - Integrate with SystemLink's scheduling assistant

Actions are defined once in the workflow and can be made available in specific
state-substate combinations. You control which actions appear when, and in what
order, providing a guided experience for test operators.

#### Adding visual cues with action icons

Visual icons help users quickly identify and understand available actions. Icons
appear next to action buttons in the UI, making it easier for operators to
navigate complex workflows.

![available icons](./workflow-icons.png)

- `READY`
- `APPROVE`
- `START`
- `PAUSE`
- `RESUME`
- `ABORT`
- `CANCEL`
- `END`
- `GENERATE`
- `DEPLOY`
- `RESET`
- `SCHEDULE`

Example:

```json
{
  "name": "StartDeploy",
  "displayText": "Deploy",
  "iconClass": "DEPLOY",
  "helpText": "Deploy the test to the test system.",
  "executionAction": {
    "type": "JOB",
    "jobs": [...]
  }
}
```

#### Customizing actions for specific test types

While workflows define the general process, you may need test-specific
variations of certain actions. Templates can override workflow actions to
provide specialized behavior for particular test types.

**When to use action overrides:**

- Different test types need different deployment scripts
- Specific tests require additional validation steps
- Test-specific parameters need to be passed to jobs or notebooks

Action overrides are defined in the template's `executionActions` property and
take precedence over the workflow actions. This requires the
`testplan:OverrideWorkflowAction` privilege to ensure proper access control.

### Integrating dashboards for real-time monitoring

Dashboard integration allows you to provide context-aware monitoring and
analysis tools that appear when most relevant in your testing process.

**Use cases for dashboard integration:**

- Real-time test execution monitoring during the "Running" substate
- Historical trend analysis during result review phases
- System health monitoring during calibration or setup phases
- Failure analysis tools when tests are in error states

The `dashboardAvailable` property controls when the View Dashboard button
appears. You can show or hide it based on test plan state, ensuring users only
see dashboard access when it's contextually useful.

Example workflow state configuration:

```json
{
  "name": "SCHEDULED",
  "dashboardAvailable": true,
  "defaultSubstate": "Scheduled",
  "substates": [
    {
      "name": "SCHEDULED",
      "displayText": "Scheduled",
      "helpText": "Ready for execution at the scheduled time.",
      "availableActions": [...]
    }
  ]
}
```

Example dashboard configuration in test plan template:

```json
{
  "name": "Hardware Test Template",
  "workflowId": "custom-workflow-id",
  "dashboard": {
    "id": "bewgxt667fda8c",
    "variables": {
      "partnumber": "<partNumber>",
      "location": "<properties.Location>",
      "version": "1.0"
    }
  },
  "executionActions": [...],
  ...
}
```

The dashboard configuration uses property replacement syntax (`<property_name>`)
to pass test plan data to the dashboard as variables. Built-in properties like
`partNumber` can be referenced directly, while custom properties use the
`<properties.property_name>` format.

### Working with the default workflow vs. custom workflows

**Default workflow approach:** Test plans without a custom workflow use
SystemLink's default workflow, which provides basic state management but **no
longer includes any default actions**. This means that you must define your own
custom workflow to add execution actions - you can no longer override default
actions within a test plan template since none exist.

**Custom workflow approach:** For any testing process that requires automation
or custom actions, create a custom workflow first, then reference it in your
templates:

1. Define your custom workflow with specialized substates and actions
2. Create templates that reference the workflow via `workflowId`
3. Optionally override specific actions in templates for test-specific behavior

## Execution action implementation patterns

#### Job execution actions

Job actions execute a Systems Management job on the system assigned to the test
plan. The job can execute one or more functions that are
[SaltStack modules](https://docs.saltproject.io/en/latest/py-modindex.html).

Job execution actions may specify one or more jobs to execute. Jobs are queued
and executed in the order they are defined in the `jobs` array. If you want to
organize results more granularly or allow jobs to be cancelled independently,
consider splitting functions into multiple jobs.

If you need to restart the system between functions, split the functions into
separate jobs with a restart job between them. A system restart will stop a job
execution, so use the `nisysmgmt.restart` or `nisysmgmt.restart_if_required`
function as a separate job.

#### Notebook execution actions

Notebook actions execute a Jupyter Notebook on the server. The notebook must be
published to make it available for execution. To publish a notebook, open the
notebook in the Scripts UI. Right-click on the notebook from the Jupyter File
Browser and select **Publish to SystemLink**. In the Publish Notebook side
panel, select the desired workspace and select the "Test Plan Operations"
interface, then click **Publish to SystemLink**.

The `notebookId` field of the action specifies the ID of the notebook to
execute. The ID can be found in the Scripts UI. Navigate to the Analysis
Development tab and locate the published notebook. Right-click on the notebook
and select **Edit**. The notebook ID will be displayed in the Edit Published
Notebook panel.

![Published notebook ID](/.attachments/published-notebook-id.png)

#### Job arguments

Jobs can be parameterized with positional and keyword arguments. Arguments are
specified in the `arguments` field of the job execution action definition. The
arguments can be any valid JSON value including strings, numbers, booleans,
arrays, and objects. Objects may be nested multiple levels.

A job definition may specify multiple functions. Therefore, the `arguments`
field expects an array of arrays, where each inner array represents the
arguments for the corresponding co-indexed function in the `functions` array.

```json
"functions": [
  "function 1",
  "function 2"
],
"arguments": [
  [
    "argument for function 1"
  ],
  [
    "argument 1 for function 2",
    "argument 2 for function 2"
  ]
]
```

#### Notebook parameters

Notebooks can be parameterized with positional parameters. Parameters are
specified in the `parameters` field of the notebook execution action definition.
The parameters can be any valid JSON value including strings, numbers, booleans,
arrays, and objects. Objects may be nested multiple levels.

For notebooks, the `parameters` field expects an array. The `testPlanId` and
`systemId` properties are always passed as parameters to a notebook and do not
need to be specified.

#### Escaping arguments and parameters

When passing string arguments or parameters to a job or notebook, it is
important to ensure that they are properly escaped. Arguments and parameters
must be escaped when passed as JSON to the Work Order service and escaped again
to be passed to the job or notebook execution. For example, if passing a path as
an argument or parameter, the backslashes must be escaped once for JSON parsing
by the Work Order service and then again to be passed to job or notebook
executions: `"C:\\\\\\\\path\\\\to\\\\sequence.seq"`.

Refer to the Work Order API Swagger documentation for more details on the schema
of the actions.

#### Argument and parameter property replacement

The arguments and parameters may use property replacement to insert property
values from the test plan when executing the action. Use the format
`<property_name>` to insert a built-in property value, for example
`"<partNumber>"` will pass the test plan's `partNumber` for that argument or
parameter when the action is executed. To pass the test plan ID, either `<id>`
or `<testPlanId>` can be used. Only string arguments support property
replacement.

Custom properties may be referenced as `"<properties.property_name>"`. An
argument or parameter may contain multiple property replacements, such as this
example containing the path to a sequence file:
`".\\\\TestPrograms\\\\<partNumber>\\\\<testProgram>.seq`.

Angle brackets `<` and `>` are used to denote parameters. If the argument or
parameter itself contains angle brackets, they must be escaped with a backslash
`\`. Additionally, properties names may not contain `<`, `>`, or `\` characters.

Parameter replacement is useful for defining parameterized actions in the test
plan template that use information from the test plan instance. It can also
allow for parameter values to be specified by the operator in the UI when using
a property that the operator may set.

> :warning: Do not use sensitive information in the arguments or parameters. The
> values are passed through the API in plain text and are not encrypted.
> Additionally, the values are stored in the database in plain text and can be
> queried through the API. The arguments and parameters will also appear in the
> execution results views.

> :warning: Arguments and parameters are not validated or sanitized by the Work
> Order service before being passed to the job or notebook. Ensure that the job
> or notebook properly validates the values before using them. For example, the
> `cmd.run` job function allows for shell commands to be executed. If the value
> is not properly sanitized, an attacker could execute arbitrary shell commands.
