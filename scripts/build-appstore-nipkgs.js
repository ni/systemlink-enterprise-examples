/**
 * Build script for App Store .nipkg packages.
 *
 * Scans for nipkg.config.json files and invokes the sl-webapp-nipkg CLI
 * to produce .nipkg packages in dist/nipkgs/.
 *
 * For each package directory, this script:
 *  1. Creates a temp staging directory containing the content file(s)
 *  2. Runs `npx sl-webapp-nipkg build` with the config and staging dir
 *  3. Moves the output .nipkg to the centralized dist/nipkgs/ directory
 *  4. Generates a manifest.json for App Store submission
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

/**
 * Each entry maps a search directory to a mapping of package name to the
 * content file that should be packaged inside the .nipkg (relative to the
 * package's parent directory, i.e. the directory containing the package
 * subdirectory).
 */
const PACKAGE_DIRS = [
  {
    searchDir: path.join(ROOT, "examples/dashboards/Asset Utilization"),
    contentMap: {
      "ni-example-asset-utilization-dashboard": "Asset Utilization.json",
      "ni-example-lab-utilization-dashboard": "Lab utilization.json",
      "ni-example-system-utilization-dashboard": "System Utilization.json",
    },
  },
  {
    searchDir: path.join(ROOT, "examples/Asset Utilization"),
    contentMap: {
      "ni-example-utilization-etl-notebook": "Utilization to Tags SLE.ipynb",
    },
  },
];

const OUT_DIR = path.join(ROOT, "dist/nipkgs");

function findConfigs() {
  const configs = [];
  for (const { searchDir, contentMap } of PACKAGE_DIRS) {
    if (!fs.existsSync(searchDir)) continue;
    for (const entry of fs.readdirSync(searchDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const configPath = path.join(searchDir, entry.name, "nipkg.config.json");
      if (!fs.existsSync(configPath)) continue;

      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const contentFile = contentMap[config.package];
      if (!contentFile) {
        console.warn(
          `  ⚠ No content mapping for package "${config.package}" — skipping`
        );
        continue;
      }
      const contentPath = path.join(searchDir, contentFile);
      if (!fs.existsSync(contentPath)) {
        throw new Error(
          `Content file not found: ${contentPath} (for package ${config.package})`
        );
      }
      configs.push({
        pkgDir: path.join(searchDir, entry.name),
        configPath,
        config,
        contentPath,
        contentFile,
      });
    }
  }
  return configs;
}

function sha256(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

const PACKAGE_NAME_RE = /^[a-z0-9][a-z0-9.+-]{2,}$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

function validateConfig(config, configPath) {
  if (!PACKAGE_NAME_RE.test(config.package)) {
    throw new Error(
      `Invalid package name "${config.package}" in ${configPath}. ` +
        `Must match ${PACKAGE_NAME_RE}`
    );
  }
  if (!SEMVER_RE.test(config.version)) {
    throw new Error(
      `Invalid version "${config.version}" in ${configPath}. ` +
        `Must be MAJOR.MINOR.PATCH`
    );
  }
  if (config.architecture && config.architecture !== "windows_all") {
    throw new Error(
      `Invalid architecture "${config.architecture}" in ${configPath}. ` +
        `Must be "windows_all"`
    );
  }
}

function buildPackage(entry) {
  const { pkgDir, config, contentPath, contentFile, configPath } = entry;

  validateConfig(config, configPath);

  // Create a temp staging directory with the content file
  const stagingDir = path.join(pkgDir, ".build-staging");
  fs.mkdirSync(stagingDir, { recursive: true });
  fs.copyFileSync(contentPath, path.join(stagingDir, contentFile));

  const nipkgFileName = `${config.package}_${config.version}_${config.architecture}.nipkg`;

  try {
    // Run sl-webapp-nipkg build from the package directory so that
    // relative paths in nipkg.config.json (iconFile, screenshotFiles)
    // resolve correctly.
    const cmd = [
      "npx",
      "sl-webapp-nipkg",
      "build",
      "--skip-cleanup",
      "--config",
      "nipkg.config.json",
      "--build-dir",
      ".build-staging",
      "--output-dir",
      JSON.stringify(OUT_DIR),
    ].join(" ");

    execSync(cmd, { cwd: pkgDir, stdio: "inherit" });

    // The tool outputs to OUT_DIR with its own naming convention
    const outputPath = path.join(OUT_DIR, nipkgFileName);
    if (!fs.existsSync(outputPath)) {
      // Try to find the file with slightly different naming
      const files = fs
        .readdirSync(OUT_DIR)
        .filter(
          (f) => f.startsWith(config.package) && f.endsWith(".nipkg")
        );
      if (files.length > 0) {
        const foundPath = path.join(OUT_DIR, files[files.length - 1]);
        if (foundPath !== outputPath) {
          fs.renameSync(foundPath, outputPath);
        }
      }
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Expected output not found: ${outputPath}`);
    }

    // Generate manifest.json for App Store submission
    const manifest = {
      package: config.package,
      version: config.version,
      displayName: config.displayName,
      description: config.description,
      section: config.section,
      maintainer: config.maintainer,
      homepage: config.homepage,
      appStoreCategory: config.appStoreCategory,
      appStoreType: config.appStoreType,
      appStoreAuthor: config.appStoreAuthor,
      appStoreMinServerVersion: config.appStoreMinServerVersion,
      license: config.license,
      appStoreTags: config.appStoreTags,
      appStoreRepo: config.appStoreRepo,
      sha256: sha256(outputPath),
      size: fs.statSync(outputPath).size,
      filename: nipkgFileName,
    };
    const manifestPath = path.join(
      OUT_DIR,
      `${config.package}.manifest.json`
    );
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return { package: config.package, nipkgPath: outputPath, manifestPath };
  } finally {
    // Clean up staging directory
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

function main() {
  console.log("Building App Store .nipkg packages...\n");
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const configs = findConfigs();
  if (configs.length === 0) {
    console.error("No nipkg.config.json files found.");
    process.exit(1);
  }

  console.log(`Found ${configs.length} package config(s):\n`);

  const results = [];
  for (const entry of configs) {
    console.log(`[${entry.config.package}]`);
    const result = buildPackage(entry);
    results.push(result);
    console.log();
  }

  console.log("Build complete. Output:");
  for (const r of results) {
    const size = fs.statSync(r.nipkgPath).size;
    const sizeKB = (size / 1024).toFixed(1);
    console.log(`  ${path.basename(r.nipkgPath)} (${sizeKB} KB)`);
  }
}

main();
