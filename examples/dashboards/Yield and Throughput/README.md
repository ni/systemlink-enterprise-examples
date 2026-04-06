# Yield and Throughput Example

## Overview:

This example project provides all required resources to configure and execute a Yield and Throughput workflow
example. It includes two Jupyter Notebooks, instructions for implementing a scheduled routine for data processing, and
one Grafana dashboard designed to visualize yield and throughput over specific timeframes and parameters.

## Solution Overview:

Fill out overview and below list out different artifacts and details.

1. Yield and Throughput Dashboard
	- Overall data yield, total units, passed units, etc
1. FirstPassYield Notebook
	- this notebook takes all relevant data and separates that for pass, fail, totals, etc and then calculates first pass yield.
	  can be grouped by various parameters, date range, product, system.
1. UpdateTestIteration Notebook
	- takes most recent units from the last hour and checks if they already have been tested before with the same serial number.
	  If the test iteration parameter does not exist, it assigns test iteration to zero.  If the iteration parameter does exist,
	  the notebook will increment the iteration appropriately. 
	  
## Step-by-step installation Instructions:

