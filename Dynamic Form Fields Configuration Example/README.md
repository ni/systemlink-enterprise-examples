# Dynamic Form Fields Configuration Example

This example demonstrates how to define a Dynamic Form Fields configuration 
with a set of fields from each field type.

## Dynamic Form Fields Configuration

A Dynamic Form Field configuration is used to display custom fields inside 
the following resources in SystemLink Enterprise: Work order, Test plan, 
Product, Asset, and System. 

Dynamic Form Fields configurations can be created using the Dynamic Form 
Fields API's POST `/nidynamicformfields/v1/configurations` endpoint. 

The [DynamicFormFieldConfigurationExample.json](DynamicFormFieldConfigurationExample.json) 
provides an example of a Dynamic Form Fields configuration with 1 view,
1 group, and one example from each available type of fields:

  - Text Field
  - Checkbox Field
  - Number Field
  - Enum Field
  - Date Field

This Dynamic Form Field configuration will appear only after having added a Custom Property 
named "example" with the value set to "1" (displayRule).

## How to use this example

Before using this example file, you should read the [Documentation](https://www.ni.com/docs/en-US/bundle/systemlink-enterprise/page/adding-custom-fields-to-the-ui.html) and:

  - update all workspace IDs to the correct one
  - check and update the resource type to define the resource in which the
    Dynamic Form Fields configuration will appear,
  - check and update the display rule - More complex rule: "name == 'NI' &&
     (properties['Location'] == 'Austin' || 'Austin' in keywords)"
