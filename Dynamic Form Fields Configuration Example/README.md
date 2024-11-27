# Dynamic Form Fields Configuration Example

This example demonstrates how to define a Dynamic Form Fields Configuration 
with a set of fields from each field type.

## Dynamic Form Fields Configuration

A Dynamic Form Field Configuration is used to display cusmtom fields inside 
ome resources in SLE. 

Dynamic Form Fields Configurations can be created using the Dynamic Form 
Fields API's POST `/nidynamicformfields/v1/configurations` endpoint. 

The [DynamicFormFieldConfigurationExample.json](DynamicFormFieldConfigurationExample.json) 
provides an example of a dynamic Form Fields Configuration with 1 view,
2 groups and several examples from all types of fields:

  - Text Field
  - Checkbox Field
  - Number Field
  - Enum Field

## How to use this example

Before using this example file, you should check the following:

  - update all workspace IDs to the correct one
  - check and update the resource Type to define the resource in which the
    dynamic Form Fields COnfiguration will appear
