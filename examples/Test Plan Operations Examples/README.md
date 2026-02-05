# Test Plan Operations Example

Customize test plan workflows to match the processes of your organization. 

You can choose from two levels of customization:

- **Test Plan Templates Only** - Define common test plan fields
- **Custom Workflows + Templates** - Define custom states, substates, actions,
   and business logic

## When to use test plan templates

Use test plan templates to standardize common test plan properties (part numbers, test programs, etc.) without changing the core workflow.

## When to create custom workflows

Organizations with specialized testing processes can customize their
workflows to exert more control over a test plan lifecycle.

Create custom workflows to accomplish the following goals:

- Define custom substates that reflect your specific testing process such as
  "Deploying", "Calibrating", and "Warming Up"
- Add state-specific custom action buttons to trigger specific jobs or
  notebooks
- Link to a custom dashboard
- Implement approval processes
- Implement multi-stage testing workflows
- Localize substates and actions for international teams

## Test plan templates

A test plan template defines default values and behaviors for a specific type of
test. Templates work with either the default SystemLink workflow or can
reference a custom workflow for specialized processes.

You can create test plan templates through the Work Order API's POST
`/niworkorder/v1/testplan-templates` endpoint. The
[TestPlanTemplate.json](TestPlanTemplate.json) file provides an example of a test
plan template that includes execution actions.

**Basic template capabilities:**

- Pre-populate test plan fields such as part number, test program, and system requirements
- Set the property replacement for dynamic values

**Template with custom workflow:**

- Reference a custom workflow by `workflowId` to define specialized states and
  actions
- Override specific workflow actions with test-specific implementations
- Inherit all custom substates and business logic from the workflow

## Custom workflows

Custom workflows define the complete lifecycle, states, and available actions
for test plans. You can create workflows separately from templates and reuse those workflows across multiple test plan templates.

You can create custom workflows through the Work Order API's POST
`/niworkorder/v1/workflows` endpoint. The
[workflow-template.json](workflow-template.json) file provides a complete
example of a custom workflow definition. 

A custom workflow definition includes the following properties:
- Custom states and substates for detailed progress tracking
- Multiple action types, such as manual, job execution, notebook execution, and scheduling
- State transition logic with available actions per substate
- Dashboard integration settings
- Privilege requirements for action execution

### Understanding states and substates

States represent the major phases of your test plan lifecycle. Substates
provide granular status information within each phase. 

This two-state level approach allows you to complete the following actions:
- **Track detailed progress** - Display specific activities such as "Deploying",
  "Calibrating", or "Warming Up" within broader states
- **Provide user-friendly status** - Display meaningful status messages to
  operators and stakeholders
- **Control action availability** - Make specific actions available only during
  appropriate substates

**Required states:** All workflows must include the following standard SystemLink states:
`NEW`, `DEFINED`, `REVIEWED`, `SCHEDULED`, `PENDING_APPROVAL`, `CLOSED`, and
`CANCELED`. These states ensure compatibility with SystemLink.

**Custom substates:** Within each state, you can define multiple substates that
reflect your specific testing process. For example, within the `SCHEDULED`
state, you can have substates such as "Scheduled", "Deploying", "Ready", or
"Failed Deployment".

In the Test Plans application, substates appear as the "Status" property. This property
gives users clear visibility into exactly where each test stands in your process.

### Localizing substates for global teams

If your organization operates across multiple regions, you can localize substate
labels and help text. Localize this text to provide a native language experience for each user.

In a custom workflow, each substate can include a `displayText` property, a
`helpText` property, and an `i18n` array. The `i18n` array allows
you to provide translations for different languages. The UI will display the
appropriate label and help text based on the user language settings. If a
translation is not provided for the current language, the UI will use
the default `displayText` and `helpText` properties.

The following is an example from a custom workflow:

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

Actions are the buttons that appear in the test plan UI. Buttons allow users to
trigger specific activities during your testing process. 

Each action can accomplish the following:

- **Execute automation** - Trigger jobs on test systems, run analysis notebooks,
  or integrate with external tools
- **Control workflow progression** - Transition test plans between states and
  substates
- **Provide user guidance** - Display contextually appropriate actions based on
  current test status

**Action types:**

Actions are defined once in a workflow and are then made available in specific
state-substate combinations. You can control when actions appear, and in what
order, to provide a guided experience for test operators.

The following action types are available:

- `JOB` - Execute Systems Management jobs such as deployment, calibration, and test
  execution
- `NOTEBOOK` - Run Jupyter notebooks for data analysis or reporting
- `MANUAL` - Implement simple state transitions without automation such as approvals and manual
  checks)
- `SCHEDULE` - Integrate the SystemLink scheduling assistant

#### Adding visual cues with action icons

Visual icons help users understand the available actions. Icons
appear next to action buttons in the UI to assist operators
in navigating complex workflows.

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

While workflows define the general process, some actions need test-specific
variations. Templates can override workflow actions to
provide specialized behavior for particular test types.

**When to use action overrides:**

Action overrides are defined in the template's `executionActions` property and
take precedence over the workflow actions. This requires the
`testplan:OverrideWorkflowAction` privilege to ensure proper access control.

You can use an action override under the following circumstances:

- To use different test types on deployment scripts
- To use additional validation steps on specific tests
- To pass test-specific parameters to jobs or notebooks

### Integrating dashboards for real-time monitoring

Dashboard integration allows you to provide context-aware monitoring and
analysis tools that appear when most relevant in your testing process.

**Use cases for dashboard integration:**

Integrated dashboards have the following advantages:

- Real-time test execution monitoring during the "Running" substate
- Historical trend analysis during result review phases
- System health monitoring during calibration or setup phases
- Failure analysis tools for tests are in an error state

The `dashboardAvailable` property controls when the View Dashboard button
appears. You can display the dashboard based on test plan state, ensuring users only
see dashboard access when it's contextually useful.

The following is an example of a workflow state configuration:

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

The following is an example of a dashboard configuration in the test plan template:

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
to pass test plan data to the dashboard as variables. Built-in properties such as
`partNumber` can be referenced directly. Custom properties use the
`<properties.property_name>` format.

### Working with the default workflow vs. custom workflows

**Default workflow approach:** Test plans without a custom workflow use
the default workflow of SystemLink. This workflow provides basic state management but no
longer includes any default actions. 

You must define your own custom workflow to add execution actions. You can no longer override default actions within a test plan template because there are not default actions.

**Custom workflow approach:** For any testing process that requires automation
or custom actions, use the following steps.

1. Define your custom workflow with specialized substates and actions
2. Create templates that reference the workflow through `workflowId`
3. Optionally override specific actions in templates for test-specific behavior

## Execution action implementation patterns

#### Job execution actions

Job actions execute a Systems Management job on the system assigned to the test
plan. The job can execute one or more functions that are
[SaltStack modules](https://docs.saltproject.io/en/latest/py-modindex.html).

Job execution actions can specify one or more jobs to execute. Jobs queue
and execute in the order they are defined in the `jobs` array. If you want to
organize results more granularly or allow jobs to be cancelled independently,
consider splitting functions into multiple jobs.

If you need to restart the system between functions, split the functions into
separate jobs with a restart job between them. A system restart will stop a job
execution, so use the `nisysmgmt.restart` or `nisysmgmt.restart_if_required`
function as a separate job.

#### Notebook execution actions

Notebook actions execute a Jupyter Notebook on the server. The notebook must be
published to make it available for execution. 

To publish a notebook, open the notebook in the Scripts UI. 

1. Right-click on the notebook from the Jupyter File Browser and select **Publish to SystemLink**. 
2. In the Publish Notebook side panel, select the desired workspace.
3. Select the Test Plan Operations interface, then click **Publish to SystemLink**.

The `notebookId` field of the action specifies the ID of the notebook to
execute. The ID can be found in the Scripts UI. 

1. Navigate to the Analysis Development tab and locate the published notebook. 
2. Right-click the notebook and select **Edit**. 

The notebook ID will be displayed in the Edit Published
Notebook panel.

![Published notebook ID](/.attachments/published-notebook-id.png)

#### Job arguments

You can parameterize jobs with positional and keyword arguments. Use the `arguments` field of the job execution action definition to specify an argument. Arguments can be any valid JSON value including strings, numbers, Booleans,
arrays, and objects. Objects can nest on multiple levels.

A job definition can specify multiple functions. Therefore, the `arguments`
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

You can parameterize notebooks with positional parameters. Use the `parameters` field of the notebook execution action definition to specify a parameter.
Parameters can be any valid JSON value including strings, numbers, Booleans,
arrays, and objects. Objects can be nested multiple levels.

For notebooks, the `parameters` field expects an array. The `testPlanId` and
`systemId` properties are always passed as parameters to a notebook and do not
need to be specified.

#### Escaping arguments and parameters

When passing string arguments or parameters to a job or notebook, ensure that the strings are properly escaped. Arguments and parameters
must be escaped when passed as JSON to the Work Order service and escaped again
to be passed to the job or notebook execution. 

For example, if passing a path as
an argument or parameter, the backslashes must be escaped once for JSON parsing
by the Work Order service and then again to be passed to job or notebook
executions: `C:\\\\\\\\path\\\\to\\\\sequence.seq`

For more information on the schema of the actions, refer to the Work Order API Swagger documentation.

#### Argument and parameter property replacement

The arguments and parameters can use property replacement to insert property
values from the test plan when executing the action. Use the format
`<property_name>` to insert a built-in property value, for example
`<partNumber>` will pass the test plan's `partNumber` for that argument or
parameter when the action is executed. To pass the test plan ID, either `<id>`
or `<testPlanId>` can be used. Only string arguments support property
replacement.

Custom properties can be referenced as `<properties.property_name>`. An
argument or parameter can contain multiple property replacements, such as this
example containing the path to a sequence file:
`.\\\\TestPrograms\\\\<partNumber>\\\\<testProgram>.seq`

Angle brackets (`<` and `>`) are used to denote parameters. If an argument or
parameter contains angle brackets, they must be escaped with a backslash
`\`. Additionally, property names cannot contain the `<`, `>`, or `\` characters.

You can use parameter replacement to define parameterized actions in the test
plan template. The template retrieves this information from a test plan instance. Using parameter replacement also allows an operator to specify parameter values in the UI when using a set property.

> :warning: Do not use sensitive information in arguments or parameters.
> The system passes unencrypted values through the API.
> Additionally, these values are stored in the database in plain text and can be
> queried through the API. Arguments and parameters can also appear in the
> execution results views.

> :warning: Arguments and parameters are not validated or sanitized by the Work
> Order service before being passed to the job or notebook. Ensure that the job
> or notebook validates the values before using them. For example, the
> `cmd.run` job function allows for the execution of shell commands. If the value
> is not sanitized, a malicious actor could execute arbitrary shell commands.