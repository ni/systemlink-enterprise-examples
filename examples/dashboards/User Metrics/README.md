# User Metrics Dashboard Example

## Overview

This example provides a **tag-native** SystemLink user-metrics workflow. It records one INT role tag per user,
computes the monthly user classification (casual / standard / operator / collaborator) inside the tracker, and writes
the results to a small set of **summary** count tags. A Grafana dashboard reads those tags directly
through the **SystemLink Tag data source** — no computation notebook is required at view time.

The solution runs on all SystemLink products, including **SystemLink Enterprise (SLE)** and **SystemLink Server
(SLS)**: it uses only the Tag, Tag Historian, User, and Auth HTTP APIs, which are common to all of them.

It includes:

- **User Metrics Tracker** (`User Metrics Tracker.ipynb`) — runs on a daily routine; writes the per-user tags and the
  summary count tags.
- **User Metrics Dashboard** (`User Metrics Dashboard.json`) — a Grafana dashboard that reads the summary
  tag history via the `ni-sltag-datasource` data source.
- **User Metrics CSV Exporter** (`User Metrics CSV Exporter.ipynb`) — optional on-demand export of the per-user tag
  history to a long-format CSV, used to true-up usage across multiple SystemLink instances. The identifying columns
  are configurable (see `Email_Output` and `User_Id_Output` below).

## Prerequisites

- **SystemLink** — a SystemLink release whose Grafana dashboards provide the **SystemLink Tags** data
  source (`ni-sltag-datasource`); that data source is what the dashboard reads. Requires **Grafana 12.3.1 or later**
  and **data source plugin 5.1.0 or later** — the shipped JSON was exported against those versions. The notebooks
  themselves use only the Tag, Tag Historian, User, and Auth HTTP APIs, which are common to all SystemLink products.
- **Services** — Tag, **Tag Historian** (the *Users by Month* chart plots tag history; without the historian only
  current values exist), User (`/niuser`), and Auth (`/niauth`).
- **Roles** — the built-in **Operator** and **Collaborator** roles must both resolve to exactly one policy template
  each. Collaborator is built in today; Operator becomes built in in an upcoming SystemLink release, so on earlier
  releases a role named `Operator` must exist. The tracker fails fast if either cannot be resolved rather
  than silently reporting zero for that tier.
- **Permissions** for the API key that runs the notebooks:
  - create tags and write tag values in the target workspace, and read tag history
  - list users (`/niuser/v1/users/query`)
  - read authorization policies and policy templates (`/niauth`) — required to classify Operator vs Collaborator
- **Workspace** — a concrete workspace to hold the tags. The nitag v2 endpoints are workspace-qualified, so if the
  API key has no default workspace you must set `WORKSPACE_TO_USE` (tracker) or `Workspace` (exporter) explicitly.
  Both notebooks fail fast rather than guessing.
- **Python packages** — `requests` (both notebooks) and `pandas` (tracker only). Both are present in the standard
  SystemLink notebook execution environment; no additional packages are needed.
- **Environment variables** — `SYSTEMLINK_HTTP_URI` and `SYSTEMLINK_API_KEY`, supplied automatically when the
  notebooks run on-platform (see *Environment* below).

## Purpose

The two consumers of the tracked tags serve different audiences and answer different questions.

### The dashboard — at-a-glance licensing posture for a single instance

The **User Metrics Dashboard** answers *"how is this SystemLink instance being used, and where is it trending?"* It
is intended for administrators and license owners who need an ongoing, self-updating view of user activity without
running any analysis by hand. Because the tracker has already reduced the raw per-user activity into the
casual / standard / operator / collaborator counts and stored them as historized tags, the dashboard is purely presentational:

- **Latest completed month by tier** — the stat panels show the casual, standard, operator, and collaborator counts
  for the most recently *closed* calendar month, plus a combined total, giving an immediate read on how the active
  population is distributed across license tiers. They are not a live "today" figure: the tracker only writes a
  month's point once that month has ended, so the value lags by up to one month.
- **Trend over time** — the *Users by Month* chart plots the monthly history, so you can see whether standard/operator
  usage is growing, plateauing, or seasonal. This is the view that supports questions like *"are we approaching a
  license tier limit?"* or *"did that rollout change how many people log in?"*

Everything the dashboard shows is scoped to the one instance (and workspace) whose tracker produced the tags. It is
meant to be left running and glanced at, not exported or post-processed.

### The CSV export — cross-instance true-up and auditing

The **User Metrics CSV Exporter** answers a question the dashboard deliberately cannot: *"how many distinct people are
using SystemLink across all of our instances, and how do they classify when we count each person only once?"* A single
instance's dashboard cannot know that a person who is a *standard* user on instance A is the same person as an
*operator* on instance B — counting the two dashboards' numbers together would double-count that person.

The exporter solves this by emitting the **raw, per-user, per-event history** (not the pre-aggregated counts) in a
portable long-format CSV. By default no email column is written at all; the pseudonymized mode reduces each user's
email to a stable pseudonymous token instead (the email and user-id representations are configurable — see
`Email_Output` and `User_Id_Output`). That raw grain is exactly what
a downstream reconciliation needs in order to:

- **De-duplicate people across instances** by matching the pseudonymized email, so a person present on several
  instances is counted once.
- **Merge each person's activity and permissions** across instances (union their logins, OR their operator flag) and
  then re-derive the casual / standard / operator classification on the combined data — producing a true fleet-wide
  headcount for licensing or compliance.
- **Audit or re-analyze offline** with different thresholds or windows than the ones baked into any one instance's
  dashboard, since the CSV carries the underlying events rather than a single frozen classification.

In short: the **dashboard is the live, per-instance summary**; the **CSV is the raw material for an accurate,
de-duplicated, multi-instance total**. They are derived from the same per-user tags but exist for different purposes.

## How It Works

### 1. Per-user tags

Once per day the tracker queries all users, determines each user's role, and writes one
INT role tag per user:

- **Tag path:** `SystemLinkUserMetrics.UserRole.<userId>`
- **Tag value:** an INT role code — `0` (neither), `1` (Operator), or `2` (Collaborator).
- **Value timestamp:** the user's latest activity time (the user's `updated` field).

A new value is written **only when the user's activity time has advanced** past the last recorded point. Because the
Tag Historian stores every written value with its timestamp, the full per-user activity-and-role history is
preserved directly in tags — with no DataFrame Service or file storage. Each recorded point therefore represents a
day on which the user was newly active (a login proxy).

> **Activity signal caveat.** The activity timestamp is the user record's `updated` field, **not** a literal
> last-login time. A point is written only when `updated` advances, so activity that does not modify the user
> record (for example, simply logging in) may not move the timestamp. A user can be actively using the instance yet
> show no new point — and therefore not be counted as active — until their user record next changes.

### 2. Summary tags

After writing the per-user tags, the tracker reconstructs the recent monthly history from the tag historian,
classifies users per month, and writes the results to count tags:

| Tag | Type | Retention | Meaning |
| --- | --- | --- | --- |
| `SystemLinkUserMetrics.UserRole.<userId>` | Int32 | duration (~24 months) | latest activity time / role code (0 none, 1 Operator, 2 Collaborator) per user |
| `SystemLinkUserMetrics.Summary.CasualUsers` | Int32 | duration (~1 year) | casual-user count, one point per calendar month |
| `SystemLinkUserMetrics.Summary.StandardUsers` | Int32 | duration (~1 year) | standard-user count, one point per calendar month |
| `SystemLinkUserMetrics.Summary.OperatorUsers` | Int32 | duration (~1 year) | operator (write-permission) count, one point per calendar month |
| `SystemLinkUserMetrics.Summary.CollaboratorUsers` | Int32 | duration (~1 year) | collaborator (read-only) count, one point per calendar month |

> **Single user-type mode.** When `User_Type_Mode = "single"` (see *Important Parameters*) the tracker does **not**
> write the four Casual/Standard/Operator/Collaborator tags above. Instead it writes a single `SystemLinkUserMetrics.Summary.ActiveUsers`
> tag (Int32, ~1 year duration) holding the count of distinct users active in each month. All the retention,
> monthly-point, and anchoring behavior described below applies identically to this tag.

All tags use rolling retention sized to what the dashboard actually needs rather than growing without bound. The
per-user and summary tags use **duration** retention: the per-user window (~24 months) covers the dashboard's twelve
plotted months *plus* the twelve-month classification lookback each of those months needs, and the summary window
(~1 year) covers the dashboard's `now-1y` plot. Writing one summary point per
calendar month builds the monthly trend directly in the Tag Historian within that window. The retention day counts are
defined at the top of the tracker notebook and mirror the analysis parameters below; keep them in sync if those
parameters change.

## How the Casual / Standard / Operator / Collaborator Counts Are Derived

For each month in the reconstructed history the tracker classifies every user using the per-user tag history. Only
users who hold **at least one permission** are tracked at all; a user with **no permissions is excluded from every
tier** (Casual, Standard, Operator, and Collaborator) and no per-user tag is written for them. Among tracked users the
rules, in evaluation order:

1. **Active in the month.** A user is considered active in month *M* only if a recorded activity timestamp falls
   **within** *M*. (The reconstructed grid is forward-filled, so this deliberately excludes users whose last activity
   predates the month — a stale login does not keep counting month after month.)

2. **Collaborator (read-only role).** Checked first among the permission-based roles: a user is a *collaborator* when
   **every** permission they hold is within the read-only Collaborator role's permission set — i.e. a non-empty
   *subset* of that role's. The Collaborator role is detected automatically by name (`"Collaborator"`); it is a
   built-in role, so if it cannot be resolved to exactly one policy template the tracker fails fast rather than
   reporting zero collaborators. For month *M* a user counts as a collaborator if the tag
   shows this role at any point within the trailing `Target_Permission_Period_Months` window ending at *M*;
   collaborators do **not** need to be active in the month.

3. **Operator (role permissions).** A user who is **not** a collaborator and whose permissions are a non-empty
   *subset* of the built-in **Operator** role's permission set. The moment a user holds a
   permission outside the Collaborator set that the Operator set still covers, they are an Operator; a user holding any
   permission **outside both** sets is neither and falls into Casual/Standard by activity. The same trailing
   `Target_Permission_Period_Months` window applies; operators do **not** need to be active in the month.

4. **Standard.** Among users active in *M*, a user is *standard* if the number of distinct recorded activity
   timestamps (logins) within the trailing `Standard_User_Period_Months` window is at least
   `Standard_User_Min_Logins`. Operators and collaborators are then removed from this set.

5. **Casual.** Users active in *M* who are none of collaborator, operator, or standard.

Priority is **collaborator > operator > standard > casual**: each user is counted in exactly one bucket, with the
higher-privilege classification winning. The counts written to the summary tags are `len(casual)`, `len(standard)`,
`len(operators)`, and `len(collaborators)` for the most recent month.

> **Role counts follow current permissions.** Rules 2 and 3 look back over a rolling window and do not require
> activity in the month, so they are additionally restricted to users who still hold at least one permission at the
> time of the run. Without that, a user whose access was revoked — or who left the organization — would keep being
> counted as an operator or collaborator for the whole lookback window, because their per-user tag still carries the
> last role it was written with.
>
> For the **most recent month** the operator and collaborator counts are taken from the permissions resolved during
> that run rather than from tag history. A per-user tag only records a new role code when the user's activity
> timestamp advances, so a role granted or revoked since the user last logged in would otherwise not appear until
> their next login. Earlier, already-closed months keep the roles recorded in their own history.

> **Administrators and other broadly-permissioned users are counted.** Both role rules require a user's permissions to
> be a *subset* of that role's, so anyone holding permissions beyond both roles — administrators most obviously — is
> not a collaborator or an operator. They are still tracked and still counted: they fall through to **Casual or
> Standard by activity**, like any other permissioned user.

> **Single user-type mode.** When `User_Type_Mode = "single"` only rule 1 (active-in-the-month) is evaluated: every
> user with a recorded activity timestamp inside month *M* is counted once as an **Active User**. The standard/operator/collaborator
> rules and the collaborator > operator > standard > casual priority do not apply, and the single `Summary.ActiveUsers` count equals
> the number of distinct users active that month.

> **"Most recent month" excludes the current, in-progress month.** The summary tags reflect the latest *completed*
> month, so a point written today (in the still-open month) does not appear in any count until that month completes
> on the next run in the following month. Combined with the
> `updated`-field activity signal above, this is why a user who becomes active — or is granted a permission — during
> the current month may not be reflected in the counts until the following month.
>
> Each month is written exactly once and never revised: the Tag Historian *appends* a value at a timestamp rather
> than replacing it, so re-writing an open month on every daily run would stack duplicate points at the same
> month-start timestamp instead of updating the count.

## Important Parameters

### User Metrics Tracker (`User Metrics Tracker.ipynb`)

Set these in the first code cell and in the classification-parameters cell before publishing. They are read from
notebook variables (not the environment) except where noted.

| Parameter | Default | Notes |
| --- | --- | --- |
| `TAG_PREFIX` | `"SystemLinkUserMetrics"` | Root prefix for all tags. Must match the exporter and dashboard. |
| `WORKSPACE_TO_USE` | `None` | Target workspace. `None` = caller's default workspace; otherwise a workspace **name** (e.g. `"DTP"`) or ID. Resolved to a concrete ID before any tag write. |
| `TEST_MAX_USERS` | `None` | `None` (the deployment default) tracks every user. **Set to an integer N only for testing** to cap the run at the first N users; it must be `None` for a real deployment. |
| `Standard_User_Min_Logins` | `25` | Minimum distinct logins in the lookback window to classify a user as *standard*. |
| `Standard_User_Period_Months` | `12` | Rolling lookback window (months) for the standard-user login count. |
| `Target_Permission_Period_Months` | `12` | Rolling lookback window (months) for detecting operator/collaborator role. |
| `User_Type_Mode` | `"tiered"` | `"tiered"` writes the Casual / Standard / Operator / Collaborator counts. `"single"` is for instances with only one license tier: every user active in a month is counted once as **Active Users** (the `Standard_User_*` and `Target_Permission_*` thresholds and the permission lookup are skipped), and only the `Summary.ActiveUsers` tag is written. Set near the top of the notebook, because it also disables the authorization queries. |

The classification parameters are **baked into the summary tags at write time**. Changing them changes future counts
but does not rewrite history already stored in the historian.

### User Metrics CSV Exporter (`User Metrics CSV Exporter.ipynb`)

| Parameter | Default | Notes |
| --- | --- | --- |
| `Tag_Prefix` | `"SystemLinkUserMetrics"` | Must match the tracker's `TAG_PREFIX`. |
| `Workspace` | `""` | Workspace **name** (e.g. `"DTP"`), ID, or blank for the default workspace. Resolved to a concrete ID before querying. |
| `Output_Path` | `"user_metrics_export.csv"` | Path of the CSV to write. |
| `Start_Time` | `""` | ISO 8601 start of the export window; blank = from the beginning. |
| `End_Time` | `""` | ISO 8601 end of the export window; blank = now. |
| `Email_Output` | `"none"` | How the email column is written: `"pseudonymized"` (an `email_hash` keyed HMAC-SHA256 token — the only mode that can be unioned/deduplicated across instances), `"plaintext"` (a raw `email` column), or `"none"` (no email column, and the email lookup is skipped entirely so no address is ever read). |
| `User_Id_Output` | `"plaintext"` | How the `user_id` column is written: `"plaintext"` (the raw GUID) or `"pseudonymized"` (a keyed HMAC-SHA256 token, still a stable per-user pseudonym). |

### Environment (provided automatically by SystemLink notebook execution)

Both notebooks read `SYSTEMLINK_HTTP_URI` (base URL) and `SYSTEMLINK_API_KEY` from the environment. SystemLink
supplies these when the notebook runs as a routine/execution, so no manual configuration is needed on-platform.

The **User Metrics CSV Exporter** uses one additional secret, `PSEUDONYMIZATION_SECRET` — the HMAC key used for the
`email_hash` and pseudonymized `user_id` tokens. It is a **hardcoded constant** at the top of the exporter's setup
cell; replace the default placeholder with a private, random value before deploying. Whenever `Email_Output` or
`User_Id_Output` is `"pseudonymized"`, the exporter runs a startup check that **fails fast** if the secret is still the
placeholder, so a publicly-known key can never be used silently. Every instance whose exports are unioned together must
use the **same** secret (a different secret yields non-matching tokens for the same person). With the shipped defaults
(`Email_Output = "none"`, `User_Id_Output = "plaintext"`) no secret is required and the notebook runs as-is.

## Setup Instructions

### Publishing the Tracker Notebook

1. From the SLE main menu open **Automation >> Scripts**, click **Upload Files**, and select
   _User Metrics Tracker.ipynb_.
2. In the first code cell set `TAG_PREFIX` and `WORKSPACE_TO_USE`. For an instance with only one license tier set
   `User_Type_Mode = "single"` in that same cell (the default `"tiered"` keeps the Casual / Standard / Operator /
   Collaborator split). In the classification-parameters cell adjust `Standard_User_Min_Logins`,
   `Standard_User_Period_Months`, and `Target_Permission_Period_Months` as needed, and leave `TEST_MAX_USERS = None`
   there for a real deployment.
3. Right-click the notebook, select **Publish to SystemLink**, choose the workspace, select **Periodic Execution**,
   and click **Publish to SystemLink**.

### Setting Up a Routine

1. Navigate to **Automation >> Routines** and click **Create routine**.
2. Under **General**, provide a name and description and ensure **Routine State** is enabled.
3. Under **Automation configuration**, set the **Event** to **at a specific date and time**, choose a start time,
   leave **Repeat** as **Daily**, leave **Execute a notebook** selected, and choose the _User Metrics Tracker_ notebook.
   Click **Create**.
4. Use **Automation >> Execution** to monitor runs. After each successful run, confirm the
   `SystemLinkUserMetrics.UserRole.*` and `SystemLinkUserMetrics.Summary.*` tags exist under **Tags** in SLE.
   Allow the routine to run for several days so the summary trend accumulates.

> **SystemLink Server (SLS):** Deploy the notebook as an analysis routine set to run once daily. The tag writes use
> the same Tag service API on SLS and SLE. The Tag Historian must be enabled for history to be retained.

### Importing the Dashboard

1. Ensure the **SystemLink Tags** data source (`ni-sltag-datasource`) is available in your Grafana instance.
2. From the SLE main menu, go to **Overview >> Dashboards**.
3. Click **New** in the upper-right corner and select **Import**.
4. Click **Upload dashboard JSON file** and select _User Metrics Dashboard.json_.
5. Change the dashboard name if needed, select a folder, modify the UID to ensure uniqueness, and click **Import**.
6. Open the dashboard and set the **Metrics tag source** picker at the top to the same workspace the tracker writes
   to — the one matching `WORKSPACE_TO_USE` in _User Metrics Tracker.ipynb_ (leave it on the default workspace if
   `WORKSPACE_TO_USE` is `None`). If the panels are empty after import, a mismatch here is almost always the reason.

> **This picker does not filter users.** It only tells the dashboard which workspace to read the metrics tags from.
> The counts always cover every user on the instance, regardless of which workspace is selected — a user is not
> "in" the selected workspace, the *tags* are.

The dashboard contains:

- A **Metrics tag source** variable that points every panel at the workspace holding the tracker's tags, so the
  dashboard works against whichever workspace the tracker was configured for rather than only the default one.
- Five **stat panels** showing the latest Casual / Standard / Operator / Collaborator counts plus a combined total,
  each with a sparkline of that tier's recent history.
- A stacked **Users by Month** bar chart of the summary tag history.

Its time range is fixed to roughly the last year and the time picker is hidden, so the window always matches the
one-year retention of the summary tags. To change it, edit `time.from` / `time.to` in the dashboard JSON before
importing, or unset `timepicker.hidden`.

### Adapting the Dashboard for Single User-Type Mode

The shipped `User Metrics Dashboard.json` is built for the four-tier tags. When the tracker runs with
`User_Type_Mode = "single"` it writes only `SystemLinkUserMetrics.Summary.ActiveUsers`, so retarget the imported
dashboard's panels at that tag (no separate dashboard file is needed). After importing the dashboard, open it, click
**Edit**, and:

1. **Stat panels.** Delete the *Standard Users*, *Operator Users*, *Collaborator Users*, and *Total Tracked Users*
   stat panels. Edit the remaining stat panel: point its tag query at
   `SystemLinkUserMetrics.Summary.ActiveUsers` (query type **History**) and rename the panel title to *Active Users*.
2. **Users by Month (bar chart).** Edit the panel and remove the *Standard Users*, *Operator Users*, and
   *Collaborator Users* queries, leaving one query pointed at `SystemLinkUserMetrics.Summary.ActiveUsers` (query
   type **History**). In the panel's field/override settings, update the series display name to *Active Users* (remove
   the old `CasualUsers -> Casual Users` style renames for the deleted series).
3. **Save** the dashboard.

> Prefer editing the JSON before import? Make the same changes directly in a copy of the panels' `targets`
> arrays (swap each `path` to the `ActiveUsers` tag and delete the extra targets), then
> import that JSON. Either way there is no additional file to maintain in the repository.

## Dashboard Features

**Visualization overview.** Five stat panels across the top show the most recently completed month's headcount for
each tier — Casual, Standard, Operator, and Collaborator — plus a combined total. Each reads its summary tag's history
and displays the most recent value over a sparkline of the preceding months. Below them, the stacked
*Users by Month* bar chart plots the summary tag history as one bar per calendar month, with the four tiers stacked
within each bar.

**Key metrics.** Casual and Standard classify users by *how often* they were active in a month; Operator and
Collaborator classify them by *permission*. The exact rules are in
*How the Casual / Standard / Operator / Collaborator Counts Are Derived*.

**Data flow.** The tracker notebook writes one role tag per user plus the monthly summary count tags into the Tag
Historian, and the dashboard reads those tags directly through the SystemLink Tags data source. No computation runs
at view time, so the dashboard renders at the same speed regardless of how many users the instance has.

**Interactive features.** The dashboard defines a single **Metrics tag source** variable, naming the workspace that
holds the tracker's tags; set it after importing to match the tracker's `WORKSPACE_TO_USE`. It selects where the
metrics are *read from* and does not filter which users are counted. Beyond that the dashboard is deliberately
presentational: the time picker is hidden so the window always matches the one-year retention of the summary tags.
The other import-time choice is which SystemLink Tags data source to bind to, since the panels reference it as a
template input.

**Refresh.** The dashboard has no auto-refresh interval, because the underlying data changes at most once a day when
the routine runs. Reload the page (or set a refresh interval in Grafana) to pick up the newest month.

**Use cases.** See how the active population is distributed across license tiers, watch whether Operator or Standard
usage is trending toward a tier limit, and confirm whether a rollout changed how many people actually log in. For a
fleet-wide count that counts each person once, use the CSV exporter described below.

## Exporting to CSV and Cross-Instance Usage Reconciliation

Run _User Metrics CSV Exporter.ipynb_ (publish and execute like the tracker, or run interactively) to write a
**long-format** CSV — one row per historian point per user:

| column | meaning |
| --- | --- |
| `user_id` | SystemLink user id (from the tag path) — a raw GUID, or a keyed HMAC-SHA256 token when `User_Id_Output = "pseudonymized"` |
| `email_hash` *or* `email` | email column, controlled by `Email_Output` (see below); **omitted entirely** when `Email_Output = "none"` |
| `activity_iso` | activity timestamp of that historian point (a login proxy) |
| `role` | user's role at that point: `operator`, `collaborator`, or empty (neither) |

Because the export is long-format, a user with several recorded logins in a month produces several rows. The number
of that user's rows whose `activity_iso` falls within a month is their **login count** for the month (more precisely,
the number of days on which new activity was recorded — the same quantity the tracker uses internally to decide the
*standard* classification).

> **Full-census coverage (current-value fallback).** The Tag Historian only keeps points inside each tag's retention
> window and only when the tracker wrote a new point, so a user who has not been recently active may have **no history
> in the requested range** even though the tag still holds a valid current value. When a tag has no in-range history
> the exporter falls back to the tag's **current value** and emits a single row for that user (using the current
> value's timestamp). This makes the export a **full census** of all tracked users rather than only the recently
> active ones. A user is omitted only when it has neither in-range history nor a current value inside the range. Such
> a fallback row is a point-in-time snapshot, not an in-window login, so a per-month login count derived from the CSV
> still reflects only genuine in-range activity.

### Output modes: email and user-id representation

Two parameters control how the potentially-identifying columns are written, so the same exporter can serve both
cross-instance rollups and privacy-conscious single-instance consumers.

**`Email_Output`** — how (or whether) the user's email appears:

- `"pseudonymized"` — an `email_hash` column holding a deterministic keyed **HMAC-SHA256** token. Each
  address is normalized (trimmed + lowercased) and turned into the **full 64-character hex digest**, keyed by the
  `PSEUDONYMIZATION_SECRET` constant defined in the notebook (see *Environment* above). Because the token is
  deterministic and keyed by that shared secret, the same person yields the same `email_hash` on every instance that
  uses the same secret. This is the **only** mode whose files can be unioned and deduplicated across instances.
- `"plaintext"` — a raw `email` column. Convenient for a single trusted consumer, but writes real addresses into the
  file.
- `"none"` (default) — no email column at all. The exporter also **skips the user email lookup**, so it never fetches
  any address — the most private option, best for single-instance consumers that do not need cross-instance dedup.

**`User_Id_Output`** — how the user id appears:

- `"plaintext"` (default) — the raw SystemLink user id (a re-identifiable GUID).
- `"pseudonymized"` — a keyed HMAC-SHA256 token of the id instead, to reduce the personal data in the file. It remains
  a stable per-user pseudonym (all rows for one user share a token), just not the raw GUID.

**Choosing modes.** For cross-instance rollups set `Email_Output = "pseudonymized"` and replace
`PSEUDONYMIZATION_SECRET` with a private value. For a single instance that does not need dedup, the default
`Email_Output = "none"` is the most private (no email is ever read). To further reduce PII, set
`User_Id_Output = "pseudonymized"`.

> **A CSV with `Email_Output` of `"none"` or `"plaintext"` cannot be unioned across instances.** The cross-instance
> reconciliation below keys on `email_hash`, so only `"pseudonymized"` exports feed it. Users with no email map to an
> empty `email_hash` and cannot be deduplicated by email alone.

> **Digest length and secret must match across files.** The token is the full 64-hex HMAC-SHA256 digest keyed by
> `PSEUDONYMIZATION_SECRET`. Files can only be unioned when they were exported at the same digest length **and** with
> the same secret — the same person hashed under a different secret produces a different token.

### Reconciling usage across SystemLink instances

To produce a fleet-wide true-up of casual / standard / operator / collaborator users:

1. **Export** a CSV from each instance over the same time window (matching `Tag_Prefix` and time range), with
   `Email_Output = "pseudonymized"` (not the default — set it explicitly, along with a real `PSEUDONYMIZATION_SECRET`)
   so every file carries the `email_hash` the union keys on.
2. **Union** all rows and **deduplicate identities** by `email_hash` — the same person on multiple instances collapses
   to one identity. For users with a blank `email_hash`, fall back to an instance-qualified `user_id` or exclude them.
3. For the month(s) of interest, per person: **union** all `activity_iso` timestamps and combine the `role` column —
   a person who is an operator on any instance counts as an operator; otherwise a collaborator on any instance counts
   as a collaborator.
4. **Re-apply the same classification rules** described above — active-in-month, distinct-login count vs
   `Standard_User_Min_Logins`, the collaborator/operator role, and the collaborator > operator > standard > casual
   priority — to the merged per-person data.

The result is a de-duplicated casual / standard / operator / collaborator count across all instances. Note that the CSV carries only
the raw inputs (timestamps and the role); the classification thresholds and priority are **not** embedded
in the file, so the reconciling process must apply the same parameter values the tracker uses for the numbers to
agree with each instance's own dashboard.

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| Notebook raises `SYSTEMLINK_HTTP_URI environment variable must be set` or the same for `SYSTEMLINK_API_KEY` | The notebook is running outside a SystemLink execution. Both variables are supplied automatically on-platform; set them yourself when running elsewhere. |
| Notebook raises `A workspace ID is required` or `Could not resolve a workspace ID` | The API key has no default workspace. Set `WORKSPACE_TO_USE` (tracker) or `Workspace` (exporter) to a workspace name or ID. |
| Run is slow and appears to stall | The Tag and Tag Historian services rate-limit (HTTP 429) on large tenants. Both notebooks retry with exponential backoff and self-throttle to the allowed rate; let the run finish. |
| HTTP 403 from `/niauth` or `/niuser` | The API key cannot read users or authorization policies. Both are required for Operator/Collaborator classification. |
| Dashboard panels show *No data* | The tracker has not completed a run yet, the **Metrics tag source** variable does not match the tracker's `WORKSPACE_TO_USE`, the dashboard was bound to the wrong data source at import, or `Tag_Prefix` does not match the tracker's `TAG_PREFIX`. |
| Stat panels populate but *Users by Month* is empty | Summary points are written once per calendar month, so a newly deployed tracker shows nothing until it has classified at least one closed month. |
| *Standard Users* stays at 0 | Standard requires `Standard_User_Min_Logins` distinct active days within the lookback window, and per-user history only starts accumulating once the routine begins running. A recently deployed tracker has too few recorded points for anyone to qualify, so active users land in Casual until the routine has run daily for long enough. |
| Tag history is capped at roughly 30 days | The historian honored only its default window. The tracker sets both `nitagHistoryTTLDays` and `nitagMaxHistoryDays` for this reason; for tags created before that, set `REASSERT_TAG_METADATA = True` for a single run to push the retention values onto existing tags. |
| Exporter raises `PSEUDONYMIZATION_SECRET must be changed ...` | `Email_Output` or `User_Id_Output` is `"pseudonymized"` while the secret is still the placeholder. Replace the secret, or keep the default `Email_Output = "none"`. |
| Exported CSV has fewer users than expected | Users with no permissions are not tracked at all, and a user is skipped when its tag has neither in-range history nor a current value inside the range. |

## Caveats

- The classification parameters are baked into the summary tags at write time; changing them affects only future
  runs, not history already stored.
- The login count is a proxy: activity is sampled once per daily run and only recorded when it advances, so multiple
  logins within a run interval collapse to a single point ("active days", not literal login events). This is
  consistent across instances, so cross-instance unions remain fair.
- Meaningful trends require the routine to run daily over the period being analyzed; history cannot be backfilled
  before the tracker started running.
- `TEST_MAX_USERS` must be `None` for a full deployment, otherwise only a subset of users is tracked.
