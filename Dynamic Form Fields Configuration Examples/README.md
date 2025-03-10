# Dynamic Form Fields Configuration Example

This example demonstrates how to define a Dynamic Form Fields configuration 
with a set of fields from each field type.

## Dynamic Form Fields Configuration

A Dynamic Form Fields configuration is used to display custom fields inside 
the following resources in SystemLink Enterprise: Work order, Test plan, 
Product, Asset, and System. 

Dynamic Form Fields configurations can be created using the Dynamic Form 
Fields API's POST `/nidynamicformfields/v1/configurations` endpoint. 

The [DynamicFormFieldConfigurationExample.json](DynamicFormFieldConfigurationExample.json) 
provides an example of a Dynamic Form Fields configuration with 1 view,
1 group, and one example from the following field types:

  - Text Field
  - Checkbox Field
  - Number Field
  - Enum Field
  - Date Field

This example Dynamic Form Fields configuration has a display rule (displayRule) that looks for a custom property named "example" with a value of "1", a resource type setting of test plan, and a workspace identifier. Thus it will only appear after adding a Custom Property named "example" with a value of "1" to a SLE test plan page within the indicated workspace.

## How to use this example

Refer to the SystemLink Enterprise User Manual topic [Adding Custom Input Fields to the User Interface](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/page/adding-custom-fields-to-the-ui.html) for information about configuring dynamic form fields and making them available in SystemLink Enterprise.

Make the following updates to the json example before trying it in SystemLink Enterprise:

  - update all workspace IDs to match the desired workspace
  - check and update the resource type ([list of ResourceTypes](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/page/initiating-dynamic-form-field-configuration.html])) to define the resource in which the
    Dynamic Form Fields configuration should appear - 
  - check and update the display rule (displayRule) - More complex rule: "name == 'NI' &&
     (properties['Location'] == 'Austin' || 'Austin' in keywords)"
