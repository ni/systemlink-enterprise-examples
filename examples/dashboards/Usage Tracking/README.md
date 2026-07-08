# Usage Tracking Dashboard Example

## Overview:

This example project provides all required resources to configure and execute a SystemLink user-usage
tracking workflow. It includes two Jupyter Notebooks and a Grafana dashboard designed to visualize how users
engage with SystemLink over time. The **Usage Data Tracker** notebook runs on a daily routine to collect a usage
snapshot, and the **Usage Tracking Dashboard** notebook processes that history to power the dashboard.

## Solution Overview:

This example collects a daily snapshot of user activity and permission holdings, stores it in the SystemLink
Dataframe Service (or on-disk CSV files on SystemLink Server), and visualizes the results through a Grafana
dashboard that uses the SystemLink Notebook data source. The **Usage Data Tracker** notebook, executed once per
day as a routine, appends new data to two datasets:

- **UsageCalculationData** – the latest activity timestamp for each user, used to classify casual and standard users.
- **TargetPermissionHoldingsData** – the set of users holding the permissions of a target built-in role
  (default: **Operator**), used to count target-permission users.

The **Usage Tracking Dashboard** notebook reads both datasets, applies the Grafana time-picker range, classifies
users per month, and projects a configurable number of future months. This approach ensures usage data accumulates
one day at a time, enabling straightforward visualization through the Grafana dashboard.

1. Usage Tracking
    - The Usage Tracking dashboard provides visibility into user engagement over time. It presents high-level
      metrics along with time-series charts that visualize Casual Users, Standard Users, and Target Permission
      Users, including a forward-looking projection.

## Step-by-step Installation Instructions:

Solution installation and configuration information is provided with the below step-by-step instructions.

### Publishing the Notebook

1. To import the Jupyter notebook into your SystemLink Enterprise, open **Automation >> Scripts** from the SLE
   main menu, click the **Upload Files** button, and select the _Usage Data Tracker.ipynb_ notebook.
2. (SystemLink Enterprise only) Open the notebook and, in the `EnterprisePolicyHoldingsTracking` /
   `EnterpriseLatestUpdatedTracking` classes, set the `WORKSPACE_TO_USE` constant to the id of the workspace where
   the usage dataframes should be stored. Leaving it as `None` uses the Default workspace.
3. (Optional) To track a different built-in role, change the `TARGET_ROLE_NAME` constant (default `"Operator"`).
   If the role cannot be found during the policy-template query, the notebook falls back to the built-in
   `DEFAULT_TARGET_PERMISSION_STATEMENTS`.
4. Right-click the notebook file and select **Publish to SystemLink** from the list.
5. In the **Publish Notebook** window, select the workspace where you want the notebook to be available.
6. From the **Interface** drop-down, select **Periodic Execution**.
7. Click the **Publish to SystemLink** button.

After publishing the notebook to SLE, a confirmation popup will appear indicating the operation was successful.
You can then proceed to configure the routine for scheduled execution.

### Setting Up a Routine

1. Open the SystemLink menu and navigate to **Automation >> Routines**.
2. On the Routines page, click **Create routine** in the upper-left corner of the window.
3. In the Create routine window under the **General** section, provide the following details:
    - Routine name and Description
    - Ensure **Routine State** is enabled
4. In the **Automation configuration** section:
    - From the Event dropdown, select **at a specific date and time**.
    - Set the **Start date and time**. This determines when the notebook will run each day to collect usage data.
      The exact wall-clock time is not important, only that it runs consistently once per day.
    - Leave the **Repeat** field set to **Daily**.
    - In the **Automation** field, leave **Execute a notebook** selected.
    - From the **Notebook** drop-down, select the _Usage Data Tracker_ notebook you published earlier.
    - Click **Create**. Your routine will now appear in the table along with other routines.
5. Go to the **Automation >> Execution** page to monitor the status and execution history of your notebook.
6. After the notebook runs successfully at the scheduled time, it appends a daily row to the
   **UsageCalculationData** and **TargetPermissionHoldingsData** dataframes. Navigate to the **Dataframes** tab in
   SLE to confirm the tables are being populated. Allow the routine to run for several days so that enough history
   accumulates for meaningful trends.

> **SystemLink Server (SLS):** If you are on SystemLink Server rather than Enterprise, deploy the notebook as an
> analysis routine set to run once daily. Instead of dataframes, usage data is written to CSV files under
> `C:\ProgramData\National Instruments\Shared` (`usage_data.csv` and `target_permission_holdings_data.csv`).

### Importing the Dashboard

1. Publish the _Usage Tracking Dashboard.ipynb_ notebook the same way as above so it is available as a Notebook
   data source for Grafana. This notebook reads the two dataframes and exposes the computed metrics.
2. From the SLE main menu, go to **Overview >> Dashboards**.
3. Click **New** in the upper-right corner and select **Import.**
4. In the Import Dashboard window, click **Upload dashboard JSON file** and select _Usage Tracking Dashboard.json_.
5. Change the name of the Dashboard if needed.
6. Select the folder where you want to store the imported dashboard.
7. Modify the UID to ensure uniqueness.
8. Click **Import.** The newly imported dashboard will appear immediately, pre-configured and ready for use.

The dashboard notebook exposes several parameters you can adjust to tune the classification and projection:

- **Standard_User_Min_Logins** – minimum activity changes within the lookback window for a user to be counted as a
  standard user (default `25`).
- **Standard_User_Period_Months** – rolling lookback window used for the standard-user rule (default `12`).
- **Target_Permission_Period_Months** – lookback window for counting target-permission users (default `12`).
- **Forecast_Months** – number of future months to project (default `6`).
