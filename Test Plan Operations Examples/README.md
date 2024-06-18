# Test Plan Operations Example

This example demonstrates how to define a test plan template with execution
actions that can be used to execute a test plan on a target system.

## Test plan templates

Test plan templates appear in the Work Order UI when creating a new test plan
and provide default values for the test plan. Additionally, templates can
include execution actions that allow for customized action buttons to appear in
the test plan details UI. These actions are copied to the test plan when
created.

Test plan templates can be created using the Work Order API's POST
`/niworkorder/v1/testplan-templates` endpoint. The
[TestPlanTemplate.json](TestPlanTemplate.json) provides an example of a test
plan template that includes execution actions.

## Execution actions

Execution actions create buttons in the test plan details UI that can provide
customized behavior. Actions can be defined for `START`, `PAUSE`, `RESUME`,
`ABORT`, and `END`. These actions can be one of three types:

- `JOB` - Executes a Systems Management job on the system assigned to the test
  plan, or a different system if specified in the job definition.
- `NOTEBOOK` - Executes a Jupyter Notebook on the server.
- `MANUAL` - Does not perform any action, but still provides a button in the UI
  and will transition the test plan to the next state if applicable.

`START` and `END` buttons will always be included in the UI and will behave as
`MANUAL` actions if not defined.

### Job execution actions

Job actions execute a Systems Management job on the system assigned to the test
plan. The job can execute one or more functions that are
[SaltStack modules](https://docs.saltproject.io/en/latest/py-modindex.html).

Job execution actions may also specify one or more jobs to execute. Jobs will be
queued and executed in the order they are defined in the `jobs` array. You may
consider splitting the functions you want to execute into multiple jobs if you
want to organize the results in the Systems Management UI as more granular jobs
or allow them to be cancelled independently.

If you need to restart the system between functions, the functions must be split
to separate jobs because a system restart will stop a job execution. Split the
functions into separate jobs with a restart job between them. The
`nisysmgmt.restart` or `nisysmgm.restart_if_required` function can be used to
restart the system.

### Notebook execution actions

Notebook actions execute a Jupyter Notebook on the server. The notebook must be
published to make it available for execution. To publish a notebook, open the
notebook in the Scripts UI. Right-click on the notebook from the Jupyter File
Browser and select **Publish to SystemLink**. In the Publish Notebook side
panel, select the desired workspace and select the "Test Plan Operations"
interface, then click **Publish to SystemLink**.

The `notebookId` field of the action specifies the ID of the notebook to
execute. The id can be found in the Scripts UI. Navigate to the Analysis
Development tab and locate the published notebook. Right-click on the notebook
and select **Edit**. The notebook ID will be displayed in the Edit Published
Notebook panel.

![Published notebook ID](/.attachments/published-notebook-id.png)

### Job parameters

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
    "argument for function 1",
  ],
  [
    "argument 1 for function 2",
    "argument 2 for function 2"
  ]
]
```

### Notebook parameters

Notebooks can be parameterized with positional parameters. Parameters are
specified in the `parameters` field of the notebook execution action definition.
The parameters can be any valid JSON value including strings, numbers, booleans,
arrays, and objects. Objects may be nested multiple levels.

For notebooks, the `parameters` field expects an array. The `testPlanId` and
`systemId` properties are always passed as parameters to a notebook and do not
need to be specified.

### Escaping arguments and parameters

When passing string arguments or parameters to a job or notebook, it is
important to ensure that they are properly escaped. Arguments and parameters
must be escaped when passed as json to the Work Order service and escaped again
to be passed to the job or notebook execution. For example, if passing a path as
an argument or parameter, the backslashes must be escaped once for json parsing
by the Work Order service and then again to be passed to job or notebook
executions: `"C:\\\\\\\\path\\\\to\\\\sequence.seq"`.

Refer to the Work Order API Swagger documentation for more details on the schema
of the actions.

### Argument and parameter property replacement

The arguments and parameters may use property replacement to insert property
values from the test plan when executing the action. Use the format
`<property_name>` to insert a built-in property value, for example
`"<partNumber>"` will pass the test plan's `partNumber` for that argument or
parameter when the action is executed. To pass the test plan ID, either `<id>`
or `<testPlanId>` can be used.

Custom properties may be referenced as `"<properties.property_name>"`. An
argument or parameter may contain multiple property replacements, such as this
example containing the path to a sequence file:
`".\\\\TestPrograms\\\\<partNumber>\\\\<testProgram>.seq`.

Angle brackets `<` and `>` are used to denote parameters. If the argument or
parameter itself contains angle brackets, they must be escaped with a backslash
`\`. Additionally, properties may not contain `<`, `>`, or `\` characters.

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
> Order service before being passed to the job or notebook. Ensure that the the
> job or notebook properly validate the values before using them. For example,
> the `cmd.run` job function allows for shell commands to be executed. If the
> value is not properly sanitized, an attacker could execute arbitrary shell
> commands.
