# Lab Overview Grafana Dashboard

The Lab Overview dashboard is designed to monitor a laboratory environment with multiple test systems. It is a comprehensive monitoring dashboard that provides visibility into laboratory test systems, health metrics, and test execution status.

### Purpose

This dashboard helps you:
- Monitor CPU, memory, and disk utilization across lab systems
- Track test execution status and recent test results
- Identify system health issues and active alarms

### Target Audience

- SystemLink administrators managing lab environments
- Test operators monitoring test execution
- Lab managers tracking system availability and performance

### Key Features

- CPU, memory, and disk usage visualization
- Status summary and recent results table
- Active alarms and system health indicators
- Configurable time windows for historical analysis

## Prerequisites

### Grafana Version
This dashboard is compatible with the Grafana versions supported by the NI Grafana plugins. For the latest compatibility information, refer to the [NI Grafana Plugins repository](https://github.com/ni/grafana-plugins).

### Required Data Sources

Ensure the following NI SystemLink data sources are configured and available in your Grafana instance:

1. **ni-sltag-datasource** - Provides access to system tags (CPU, memory, disk metrics)
2. **ni-sltestresults-datasource** - Provides test execution results and status information
3. **ni-slsystem-datasource** - Provides system inventory and property information
4. **ni-slalarms-datasource** - Provides active alarm and event information

>**NOTE:** If these data sources are not available in your Grafana instance, refer to the [SystemLink Grafana Plugins repository](https://github.com/ni/systemlink-grafana-plugins) for installation and configuration instructions.

## Setup Instructions

### Dashboard Installation

#### Import the Dashboard JSON

1. From SLE main menu, go to **Overview >> Dashboards**.
2. Click **New** in the upper-right corner and select **Import**.
3. There are two options:
   - **Option A**: Paste the dashboard JSON content directly
     - Open the `Lab Overview.json` file
     - Copy the entire contents
     - Paste into the "Import via dashboard JSON model" field
   - **Option B**: Upload the file
     - Click **Upload dashboard JSON file**
     - Select `Lab Overview.json`
4. Review the import dialog:
   - **Name**: Keep as "Lab Overview" or customize as needed
   - **Folder**: Select the destination folder (or create a new one for lab dashboards)
   - **Unique Identifier (uid)**: Change if you want a custom URL slug
5. Click **Import**

The dashboard is now installed and will attempt to load data from your SystemLink instance.

### Configuration and Customization

#### Time Range Configuration

The dashboard is pre-configured to display data from the last 30 days. To adjust:

1. Click the time range selector in the top-right corner
2. Choose from preset options or set a custom range
3. The dashboard will automatically refresh with data from the new range

#### Auto-Refresh Settings

To enable automatic dashboard updates:

1. Click the refresh icon (↻) in the top-right corner
2. Select an auto-refresh interval:
   - **Off**: Manual refresh only
   - **5s - 30s**: For monitoring active tests
   - **1m - 1h**: For background monitoring

**Recommendation**: Set to 30 seconds for active monitoring, or 5 minutes for passive background updates.

#### Panel-Level Customization

All dashboard panels can be customized by clicking the **Edit** button (pencil icon):

- Modify data source queries
- Change visualization type
- Adjust thresholds and color schemes
- Add or remove fields from tables

>**Note**: Changes are saved to the dashboard and affect all users viewing it.
### Customizing the Lab Utilization Canvas Panel

The Lab Utilization panel uses Grafana's **Canvas** visualization, which lets you place status indicators freely on top of a background image — such as a lab floor plan. Use this section to replace the default grid layout with a floor plan that reflects your physical lab layout.

#### Step 1: Add a Lab Floor Plan Background Image

A background image helps you place status indicators over the physical locations of your systems on the floor plan.

1. On the Lab Overview dashboard, click the **Menu** button next to the **Lab Utilization** panel title and select **Edit**.
2. In the Panel Editor, find the **Background** section.
3. Set **Image mode** to **Fixed**.
4. Click the **Select a value** field and enter the URL or path to your floor plan image.
   - The image must be accessible from the browser (hosted on a public URL or uploaded to **Product Insights > Files** in SystemLink). If you upload the image to **Product Insights > Files**, copy the file's embed link and use it as the image URL in the dashboard.
   - Supported formats: PNG, JPEG, SVG.
5. Set **Background size** to **Original** to preserve the image's native dimensions.
6. Click **Apply** to preview the background.

---

#### Step 2: Move Status Indicators to Correct Locations

The default panel contains status indicator elements (Element 1 through Element 16) arranged in a uniform grid. Reposition each element to match the physical location of the corresponding system on your floor plan.

1. In the Canvas panel editor, click the background image or any element to enter edit mode. If **Inline editing** is not already enabled, toggle **Inline editing** on in the panel options.
2. Click the element you want to move. A selection handle appears around it.
3. Drag the element to the position on the floor plan that corresponds to the physical location of the system it represents.
4. Alternatively, for precise positioning, select the element and manually set the **Left** and **Top** values under **Layout** in the element's properties panel (pixel offset from the top-left corner of the canvas).
5. Adjust **Width** and **Height** under **Layout** to resize the indicator if needed.
6. Repeat for each element until all indicators are positioned over their respective systems on the floor plan.
7. Click **Apply** to save the layout.

> **Tip**: Rename each element (for example, "System-01", "Bench-A") using the **Name** field in its properties panel. This makes it easier to identify which element corresponds to which system when managing the layout later.

---

#### Step 3: Map CPU Values to Status Indicators

Each status indicator must be linked to the CPU metric of the specific system it represents. The panel queries all CPU tags matching `*.Health.CPU.*.UsePercentage` and returns one data series per system. You then assign each series to the corresponding element.

##### Understanding the data binding

The Canvas panel uses Grafana's **data field** binding to connect each element to a specific series returned by the query. The query uses `partitionByValues` on the `name` field, so each system's CPU metric becomes a separate data frame with a distinct name.

##### Assign a data field to each element
Option 1:
1. Double-click an element to set a field.
2. Click again and from the dropdown, select the field name that corresponds to the system that the element represents.
3. Repeat for each element, selecting the matching CPU field for each system.

Option 2:
1. Click an element on the canvas to select it.
2. In the element's properties panel on the right, find the **Metric Value** section.
3. Under **Text source**, ensure the mode is set to **Field**.
4. In the **Field** dropdown, select the field name that corresponds to the system that element represents. Field names are derived from the tag path (for example, `System-01.Health.CPU.0.UsePercentage`).
5. Scroll down and in the **Background (metric-value)** section select the same field name from the **Color** dropdown.
6. Repeat for each element, selecting the matching CPU field for each system.

---

#### Step 4: Save the Dashboard

After completing your layout and data binding changes:

1. Disable **Inline Editing** toggle in Canvas section of the panel editor.
2. Click **Apply** to close the panel editor.
3. Click **Save dashboard**.
4. Add an optional description of the changes and click **Save**.

The updated floor plan layout will be visible to all users with access to the dashboard.

## Dashboard Features

### Visualization Overview

#### 1. Lab Utilization Panel

**Type**: Canvas visualization

**Purpose**: Displays CPU usage across all lab systems in a visual grid layout.

**What It Shows**:
- Each element represents a monitored system
- Color coding indicates CPU usage levels (red: high, yellow: moderate, green: normal)
- Grid layout allows you to see overall lab capacity at a glance

**Data Source**: `ni-sltag-datasource` → `*.Health.CPU.*.UsePercentage`

---

#### 2. Test Status Panel

**Type**: Stat visualization

**Purpose**: Provides a quick summary of test execution status across all recent tests.

**Status Types**:
1. Total
2. Passed
3. Failed
4. Done
5. Errored
6. Custom
7. Looping
8. Running
9. Skipped
10. Terminated
11. Timed out
12. Waiting

**Data Source**: `ni-sltestresults-datasource` → Test results with status aggregation

**Interactive Feature**: Click any status value to filter the Recent Results table below.

---

#### 3. System Health Table

**Type**: Table visualization

**Purpose**: Shows health metrics for each connected system.

**Columns**:
- System
- Memory Usage
- Disk Usage

**Data Sources**:
- `ni-slsystem-datasource` → System properties
- `ni-sltag-datasource` → Health metrics (memory and disk)

**Interactive Features**:
- Clicking system name navigates to the detailed system information
- Sortable columns (click column header)
- Column filter for searching by System
- All columns are customizable via the table settings

---

#### 4. Alarms Table

**Type**: Table visualization

**Purpose**: Displays all active alarms from monitored systems. Displays up to the 10,000 most recent alarms.

**Columns**:
- Alarm Name
- Source
- State
- Current Severity

**Data Source**: `ni-slalarms-datasource` → Active alarms only.

**Interactive Features**:
- Clicking Alarm name redirects to Alarm Details page
- Sortable columns (click column header)
- Column filter for searching by severity
- All columns are customizable via the table settings

---

#### 5. Recent Results Table

**Type**: Table visualization

**Purpose**: Comprehensive view of recent test executions with detailed information.

**Columns**:
- Test Program Name
- Part Number
- Serial Number
- Status
- Host Name
- Started at
- Updated at
- Workspace

**Data Source**: `ni-sltestresults-datasource` → All test results within time range. Displays up to the 10,000 most recent test results.

**Interactive Features**:
- Sortable columns (click column header)
- All columns are customizable via the table settings
- Column filters for searching by System