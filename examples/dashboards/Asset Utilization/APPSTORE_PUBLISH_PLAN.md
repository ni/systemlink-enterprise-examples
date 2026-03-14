# Plan: Publish Asset Utilization Dashboards to the SystemLink App Store

## Summary

Package the three Asset Utilization Grafana dashboards **and** the prerequisite
ETL notebook as App Store `.nipkg` items and automate publishing via CI so that
commits to `main` produce artifacts and open PRs against the
`systemlink-app-store` repository.

---

## 1. Package Inventory

### 1.1 Dashboards

| # | Dashboard JSON              | Package Name                               | Display Name             |
|---|-----------------------------|--------------------------------------------|--------------------------|
| 1 | `Asset Utilization.json`    | `ni-example-asset-utilization-dashboard`   | Asset Utilization        |
| 2 | `Lab utilization.json`      | `ni-example-lab-utilization-dashboard`     | Lab Utilization          |
| 3 | `System Utilization.json`   | `ni-example-system-utilization-dashboard`  | System Utilization       |

Each dashboard is a standalone Grafana JSON export. They use built-in
SystemLink data sources (`ni-slasset-datasource`, `ni-slsystem-datasource`,
`ni-slworkspace-datasource`) and need no external dependencies.

All three are part of a suite linked by the `AAU` tag, but each can be
installed independently.

### 1.2 ETL Notebook (Prerequisite)

| # | Source File                        | Package Name                                | Display Name                    |
|---|------------------------------------|---------------------------------------------|---------------------------------|
| 4 | `Utilization to Tags SLE.ipynb`    | `ni-example-utilization-etl-notebook`       | Asset Utilization ETL Notebook  |

The notebook processes raw utilization history from SystemLink's Asset and
System Management APIs and writes daily utilization values as tags. It is
designed to run as a scheduled routine (daily) and is a **prerequisite** for
all three dashboards — the dashboards visualise the tags this notebook creates.

The notebook lives in `examples/Asset Utilization/` (alongside the supporting
`Delete Multiple Tags.ipynb` helper).

### 1.3 Cross-references in descriptions

Each dashboard's `description` field must mention the ETL notebook dependency:

> Requires the **Asset Utilization ETL Notebook**
> (`ni-example-utilization-etl-notebook`) to be installed and running as a
> daily routine to populate utilization tags.

The ETL notebook's `description` must mention the dashboards it supports:

> Populates utilization tags consumed by the **Asset Utilization**,
> **Lab Utilization**, and **System Utilization** dashboard packages
> (`ni-example-asset-utilization-dashboard`,
> `ni-example-lab-utilization-dashboard`,
> `ni-example-system-utilization-dashboard`).

---

## 2. Per-Package Build Artefacts

For each dashboard, create the following files in
`examples/dashboards/Asset Utilization/<package-name>/`:

### 2.1 `nipkg.config.json`

This is the configuration file consumed by `@ni-kismet/sl-webapp-nipkg` to
produce a `.nipkg`.

```jsonc
{
  // Standard nipkg control fields
  "package": "ni-example-asset-utilization-dashboard",
  "version": "1.0.0",
  "architecture": "windows_all",
  "description": "Grafana dashboard showing asset-level utilization metrics including calibration status, utilization trends by category, and drill-down from lab to system to asset level.",
  "section": "Dashboards",
  "maintainer": "NI <support@ni.com>",
  "homepage": "https://github.com/ni/systemlink-enterprise-examples",

  // XB- extended fields (sl-webapp-nipkg will prefix automatically)
  "displayName": "Asset Utilization Dashboard",
  "userVisible": "yes",
  "plugin": "file",

  // App Store custom fields
  "appStoreCategory": "Dashboard",
  "appStoreType": "dashboard",
  "appStoreAuthor": "NI",
  "appStoreMinServerVersion": "2024 Q4",
  "appStoreLicense": "MIT",
  "appStoreTags": "assets,utilization,calibration,dashboard,grafana",
  "appStoreRepo": "https://github.com/ni/systemlink-enterprise-examples",

  // Icon/screenshot paths (relative; CI base64-encodes them)
  "appStoreIcon": "./icon.svg",
  "appStoreScreenshot1": "./screenshot.png"
}
```

Repeat for the Lab and System dashboards with appropriate `package`,
`displayName`, `description`, and `appStoreTags` values.

### 2.2 ETL Notebook `nipkg.config.json`

Create `examples/Asset Utilization/ni-example-utilization-etl-notebook/`:

```jsonc
{
  "package": "ni-example-utilization-etl-notebook",
  "version": "1.0.0",
  "architecture": "windows_all",
  "description": "Jupyter notebook that processes raw asset and system utilization history and writes daily utilization values as SystemLink tags. Designed for scheduled daily execution via SystemLink Routines. Populates utilization tags consumed by the Asset Utilization, Lab Utilization, and System Utilization dashboard packages (ni-example-asset-utilization-dashboard, ni-example-lab-utilization-dashboard, ni-example-system-utilization-dashboard).",
  "section": "Notebooks",
  "maintainer": "NI <support@ni.com>",
  "homepage": "https://github.com/ni/systemlink-enterprise-examples",

  "displayName": "Asset Utilization ETL Notebook",
  "userVisible": "yes",
  "plugin": "file",

  "appStoreCategory": "Data Analysis",
  "appStoreType": "notebook",
  "appStoreAuthor": "NI",
  "appStoreMinServerVersion": "2024 Q4",
  "appStoreLicense": "MIT",
  "appStoreTags": "assets,utilization,etl,notebook,tags,routine",
  "appStoreRepo": "https://github.com/ni/systemlink-enterprise-examples",

  "appStoreIcon": "./icon.svg"
}
```

The build script packages `Utilization to Tags SLE.ipynb` as the content file
inside this nipkg.

### 2.3 `icon.svg`

A simple SVG icon per dashboard (can share a common icon across the suite
initially). Must be ≤ 128×128.

### 2.4 `screenshot.png`

Reuse the existing screenshots from
`examples/Asset Utilization/Attachments/` (`asset-utilization.png`,
`lab-utilization.png`, `system-utilization.png`). Must be ≤ 800×600; resize if
needed. The ETL notebook package does not require a screenshot (no visual UI).

---

## 3. Node.js Build Setup

### 3.1 Add `package.json` (repository root)

```json
{
  "private": true,
  "name": "systemlink-enterprise-examples",
  "scripts": {
    "build:nipkg": "node scripts/build-appstore-nipkgs.js"
  },
  "devDependencies": {
    "@ni-kismet/sl-webapp-nipkg": "latest"
  }
}
```

### 3.2 Add `scripts/build-appstore-nipkgs.js`

A build script that:

1. Scans for directories containing a `nipkg.config.json` under:
   - `examples/dashboards/Asset Utilization/` (dashboards)
   - `examples/Asset Utilization/` (notebooks)
2. For each, invokes `@ni-kismet/sl-webapp-nipkg` to produce a
   `<package>_<version>_windows_all.nipkg` in `dist/nipkgs/`.
3. Base64-encodes the icon and screenshot(s) referenced in the config and
   embeds them as `XB-AppStoreIcon` / `XB-AppStoreScreenshot1` fields in the
   nipkg control file.
4. Computes SHA256 for each `.nipkg` file.

```
dist/nipkgs/
├── ni-example-asset-utilization-dashboard_1.0.0_windows_all.nipkg
├── ni-example-lab-utilization-dashboard_1.0.0_windows_all.nipkg
├── ni-example-system-utilization-dashboard_1.0.0_windows_all.nipkg
└── ni-example-utilization-etl-notebook_1.0.0_windows_all.nipkg
```

> **Note:** The exact API of `@ni-kismet/sl-webapp-nipkg` should be verified
> once the package's documentation is available. The build script will wrap
> whichever CLI or programmatic API the package exposes (e.g.,
> `npx sl-webapp-nipkg pack --config nipkg.config.json --content <json-file>`).

---

## 4. GitHub Actions Workflow

Create `.github/workflows/dashboard-appstore.yml`:

```yaml
name: Dashboard App Store Packages

on:
  push:
    branches: [main]
    paths:
      - 'examples/dashboards/Asset Utilization/**'
      - 'examples/Asset Utilization/**'
      - 'scripts/build-appstore-nipkgs.js'
      - '.github/workflows/dashboard-appstore.yml'
  pull_request:
    branches: [main]
    paths:
      - 'examples/dashboards/Asset Utilization/**'
      - 'examples/Asset Utilization/**'
      - 'scripts/build-appstore-nipkgs.js'
      - '.github/workflows/dashboard-appstore.yml'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Build .nipkg packages
        run: npm run build:nipkg

      - name: Upload nipkg artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dashboard-nipkgs
          path: dist/nipkgs/*.nipkg

  open-appstore-pr:
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Download nipkg artifacts
        uses: actions/download-artifact@v4
        with:
          name: dashboard-nipkgs
          path: dist/nipkgs

      - name: Checkout systemlink-app-store
        uses: actions/checkout@v4
        with:
          repository: ni/systemlink-app-store
          token: ${{ secrets.APP_STORE_PAT }}
          path: app-store
          ref: main

      - name: Prepare submission branch
        working-directory: app-store
        run: |
          BRANCH="auto/dashboard-examples-$(date +%Y%m%d-%H%M%S)"
          git checkout -b "$BRANCH"

          # Copy each nipkg and generate manifest.json for submission
          for pkg in ../dist/nipkgs/*.nipkg; do
            PKG_NAME=$(basename "$pkg" | sed 's/_[0-9].*//') # extract package name
            mkdir -p "submissions/$PKG_NAME"
            cp "$pkg" "submissions/$PKG_NAME/"

            # Generate manifest.json from nipkg metadata
            # (the build script also writes a manifest.json alongside each nipkg)
            if [ -f "../dist/nipkgs/${PKG_NAME}.manifest.json" ]; then
              cp "../dist/nipkgs/${PKG_NAME}.manifest.json" \
                 "submissions/$PKG_NAME/manifest.json"
            fi
          done

          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add submissions/
          git commit -m "feat: update Asset Utilization dashboard examples

          Auto-generated from ni/systemlink-enterprise-examples@${{ github.sha }}"
          git push origin "$BRANCH"

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v7
        with:
          token: ${{ secrets.APP_STORE_PAT }}
          path: app-store
          branch: auto/dashboard-examples-update
          title: "feat: Update Asset Utilization dashboard packages"
          body: |
            Automated update of Asset Utilization dashboard packages from
            [systemlink-enterprise-examples@${{ github.sha }}](https://github.com/ni/systemlink-enterprise-examples/commit/${{ github.sha }}).

            ### Packages updated
            - `ni-example-asset-utilization-dashboard`
            - `ni-example-lab-utilization-dashboard`
            - `ni-example-system-utilization-dashboard`
            - `ni-example-utilization-etl-notebook`

            ---
            _This PR was auto-generated by the dashboard-appstore workflow._
          labels: |
            auto-generated
            dashboard-example
```

---

## 5. Cross-Repo PR Strategy: PAT vs. Fork

This repo (`ni/systemlink-enterprise-examples`) has a PAT with write access to
`ni/systemlink-app-store`, so CI can push branches and open PRs directly. Other
repositories that contribute packages to the App Store may not have (or want)
a PAT. Two strategies are supported:

### Strategy A — Direct PAT (this repo)

Used when the source repo belongs to the same GitHub org and can be granted a
PAT/GitHub App token with write access to `ni/systemlink-app-store`.

- CI pushes a branch directly to `ni/systemlink-app-store` and opens a PR.
- Simplest flow, fewest moving parts.
- The `open-appstore-pr` job in §4 uses this strategy.

### Strategy B — Fork-based PR (external / third-party repos)

Used when the contributing repo **cannot** have a PAT to the upstream
App Store repo. This mirrors the standard open-source contribution model:

1. **One-time setup:** Create a bot-owned fork of `ni/systemlink-app-store`
   (e.g., `<org>/systemlink-app-store-fork`). The fork can be a shared
   "submission bot" fork used by multiple repos in the org.
2. **CI workflow:** The source repo's CI has a PAT scoped only to the
   **fork** (not the upstream). The `open-appstore-pr` job:
   a. Checks out the **fork** (not upstream).
   b. Pushes the submission branch to the **fork**.
   c. Opens a **cross-fork PR** from `<org>/systemlink-app-store-fork:branch`
      → `ni/systemlink-app-store:main`.
3. **PR review:** App Store maintainers review the cross-fork PR as usual.

```yaml
# Strategy B variant — replace the checkout + PR steps in §4
- name: Checkout app-store fork
  uses: actions/checkout@v4
  with:
    repository: ${{ vars.APP_STORE_FORK }}   # e.g. myorg/systemlink-app-store-fork
    token: ${{ secrets.FORK_PAT }}           # PAT scoped to the fork only
    path: app-store
    ref: main

- name: Push submission branch
  working-directory: app-store
  run: |
    # ... same branch prep as Strategy A ...
    git push origin "$BRANCH"

- name: Create cross-fork PR
  uses: peter-evans/create-pull-request@v7
  with:
    token: ${{ secrets.FORK_PAT }}
    path: app-store
    push-to-fork: ${{ vars.APP_STORE_FORK }}
    branch: $BRANCH
    title: "feat: Add packages from ${{ github.repository }}"
    body: |
      Cross-fork submission from [${{ github.repository }}@${{ github.sha }}](
      https://github.com/${{ github.repository }}/commit/${{ github.sha }}).
    labels: |
      auto-generated
      external-submission
```

**When to use which:**

| Scenario | Strategy | Secret needed |
|----------|----------|---------------|
| Same org, trusted repo (this repo) | A — Direct PAT | `APP_STORE_PAT` with `contents:write` + `pull_requests:write` on upstream |
| Different org / external contributor | B — Fork-based | `FORK_PAT` with `contents:write` on the **fork** only |
| No CI at all (manual submission) | n/a | Author runs `slcli appstore publish --prepare-pr` locally and opens PR by hand |

> **GitHub App alternative:** For orgs with many contributing repos, a
> GitHub App installed on `ni/systemlink-app-store` can issue short-lived
> installation tokens to any repo in the org. This avoids long-lived PATs
> entirely. The workflow uses `actions/create-github-app-token` to mint a
> token per run.

---

## 6. Required Secrets

| Secret              | Where                                | Purpose                                                    |
|---------------------|--------------------------------------|------------------------------------------------------------|
| `APP_STORE_PAT`     | `systemlink-enterprise-examples`     | GitHub PAT with `repo` scope on `ni/systemlink-app-store`  |
| `FORK_PAT`          | (external repos using Strategy B)    | GitHub PAT with `contents:write` on the **fork** only      |

---

## 7. Implementation Steps

| # | Step                                                        | Owner   |
|---|-------------------------------------------------------------|---------|
| 1 | Create `nipkg.config.json` for each of the 3 dashboards     | Dev     |
| 2 | Create `nipkg.config.json` for the ETL notebook             | Dev     |
| 3 | Add/prepare icon SVG and screenshot PNG per package          | Dev     |
| 4 | Add root `package.json` with `@ni-kismet/sl-webapp-nipkg`   | Dev     |
| 5 | Write `scripts/build-appstore-nipkgs.js` build script       | Dev     |
| 6 | Verify `npm run build:nipkg` produces valid `.nipkg` files  | Dev     |
| 7 | Validate nipkgs with `slcli appstore validate` (if avail.)  | Dev     |
| 8 | Create `.github/workflows/dashboard-appstore.yml`           | Dev     |
| 9 | Add `APP_STORE_PAT` secret to the repository settings       | Admin   |
| 10| Push to `main`, verify artifact creation & PR in app-store  | Dev     |
| 11| Maintainers review auto-PR in `systemlink-app-store`        | Review  |

---

## 8. Version Management

- Versions in `nipkg.config.json` follow **semver** (`MAJOR.MINOR.PATCH`).
- Initial release: `1.0.0` for all four packages.
- Bumping: When a dashboard JSON or notebook is updated, the version in its
  `nipkg.config.json` must be bumped manually (or via a script that reads
  commit history / conventional commits).
- The CI workflow only triggers when files under the Asset Utilization path
  change, so unrelated commits don't produce new packages.

---

## 9. Open Questions

1. **`@ni-kismet/sl-webapp-nipkg` API surface** — The exact CLI/programmatic
   interface for packing dashboard JSON and notebook `.ipynb` files into a
   `.nipkg` needs to be confirmed. Dashboard and notebook packages differ from
   webapp packages (`index.html`-based); the tool may need a `--type` flag or
   a `contentType` field in the config.
2. **Shared vs. individual packages** — The three dashboards are logically a
   suite. Consider whether to offer a single "Asset Utilization Suite" package
   containing all three or keep them individual. Individual packages give users
   more flexibility; this plan assumes individual.
3. **Dashboard UID conflicts** — Dashboard JSON files contain hardcoded `id`
   and `uid` fields. The import process may need to sanitize these to avoid
   conflicts on the target SystemLink instance.
4. **Delete Multiple Tags notebook** — Whether to also package the
   `Delete Multiple Tags.ipynb` helper as a companion App Store item (e.g.,
   `ni-example-delete-utilization-tags-notebook`).

---

## 10. Directory Structure After Implementation

```
systemlink-enterprise-examples/
├── package.json                          # NEW — npm config with sl-webapp-nipkg
├── package-lock.json                     # NEW — auto-generated
├── scripts/
│   └── build-appstore-nipkgs.js          # NEW — build script
├── .github/
│   └── workflows/
│       ├── python-package.yml            # EXISTING
│       └── dashboard-appstore.yml        # NEW — appstore publish pipeline
├── examples/
│   ├── Asset Utilization/
│   │   ├── Utilization to Tags SLE.ipynb               # EXISTING
│   │   ├── Delete Multiple Tags.ipynb                  # EXISTING
│   │   ├── Lab System and Asset Utilization.md          # EXISTING
│   │   ├── Attachments/                                # EXISTING
│   │   └── ni-example-utilization-etl-notebook/         # NEW
│   │       ├── nipkg.config.json
│   │       └── icon.svg
│   └── dashboards/
│       └── Asset Utilization/
│           ├── Asset Utilization.json     # EXISTING
│           ├── Lab utilization.json       # EXISTING
│           ├── System Utilization.json    # EXISTING
│           ├── ni-example-asset-utilization-dashboard/    # NEW
│           │   ├── nipkg.config.json
│           │   ├── icon.svg
│           │   └── screenshot.png
│           ├── ni-example-lab-utilization-dashboard/      # NEW
│           │   ├── nipkg.config.json
│           │   ├── icon.svg
│           │   └── screenshot.png
│           └── ni-example-system-utilization-dashboard/   # NEW
│               ├── nipkg.config.json
│               ├── icon.svg
│               └── screenshot.png
└── dist/                                  # gitignored — build output
    └── nipkgs/
        ├── ni-example-asset-utilization-dashboard_1.0.0_windows_all.nipkg
        ├── ni-example-lab-utilization-dashboard_1.0.0_windows_all.nipkg
        ├── ni-example-system-utilization-dashboard_1.0.0_windows_all.nipkg
        └── ni-example-utilization-etl-notebook_1.0.0_windows_all.nipkg
```
