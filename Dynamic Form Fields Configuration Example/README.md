# Dynamic Form Fields Configuration Example

This example demonstrates how to define a Dynamic Form Fields Configuration 
with a set of fields from each field type available.

## Dynamic Form Fields Configuration

A Dynamic Form Field Configuration is used to custom fields inside resources 
in SLE. 

Dynamic Form Fields Configurations can be created using the Dynamic Form 
Fields API's POST `/nidynamicformfields/v1/configurations` endpoint. 

The [DynamicFormFieldConfigurationExample.json](DynamicFormFieldConfigurationExample.json) 
provides an example of a dynamic Form Fields Example with a example of type 
of field available.

  - Text Field
  - Checkbox Field
  - Number Field
  - Enum Field

## How to use this example

Before using this Example file, you should check the following:

  - update all workspace IDs to the correct one
  - check and update the resource Type to define the resource in which the dynamic Form Fields will
    appear
  - (optional) update the ids of all objects (on the definition of objects and also by the use in linked
    object)
