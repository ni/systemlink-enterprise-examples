#!/bin/bash
# Deploy Blazor WASM app to SystemLink.
#
# Usage:
#   ./deploy.sh <webapp-name> <workspace>
#
# Example:
#   ./deploy.sh BLAZOR_APP BYU2026

set -e

WEBAPP_NAME="${1:?Usage: ./deploy.sh <webapp-name> <workspace>}"
WORKSPACE="${2:?Usage: ./deploy.sh <webapp-name> <workspace>}"
OUTPUT_DIR="pub"

# ── 1. Clean previous output, then publish ───────────────────────────────────
echo "==> Cleaning previous build output..."
rm -rf "$OUTPUT_DIR"

echo "==> Building..."
dotnet publish -o "$OUTPUT_DIR"

# ── 2. Locate the staticwebassets endpoints manifest ──────────────────────────
MANIFEST=$(find "$OUTPUT_DIR" -maxdepth 1 -name "*.staticwebassets.endpoints.json" | head -1)
if [ -z "$MANIFEST" ]; then
  echo "ERROR: No staticwebassets.endpoints.json found in $OUTPUT_DIR"
  exit 1
fi
echo "==> Manifest: $MANIFEST"

# ── 3. Find fingerprinted dotnet.js (exclude .br / .gz variants) ─────────────
#
# In .NET 10, the boot config is inlined into dotnet.js (renamed with a
# fingerprint like dotnet.5y8w35dinf.js). ASP.NET Core middleware maps the
# virtual path "_framework/dotnet.js" -> the fingerprinted file at runtime,
# but SystemLink serves files statically so we must create the mapping manually.
#
DOTNET_JS_FINGERPRINTED=$(
  grep -o '"Route":"_framework/dotnet\.js","AssetFile":"_framework/[^"]*\.js"' "$MANIFEST" \
    | grep -v '\.js\.br"' \
    | grep -v '\.js\.gz"' \
    | head -1 \
    | sed 's/.*"AssetFile":"_framework\/\(.*\)"/\1/'
)

if [ -z "$DOTNET_JS_FINGERPRINTED" ]; then
  echo "ERROR: Could not locate fingerprinted dotnet.js in manifest"
  exit 1
fi
echo "==> Boot config file: $DOTNET_JS_FINGERPRINTED -> dotnet.js"

# ── 4. Copy fingerprinted boot-config dotnet.js to the virtual path ───────────
FRAMEWORK_DIR="$OUTPUT_DIR/wwwroot/_framework"
cp "$FRAMEWORK_DIR/$DOTNET_JS_FINGERPRINTED" "$FRAMEWORK_DIR/dotnet.js"

# ── 5. Pack wwwroot ───────────────────────────────────────────────────────────
echo "==> Packing $OUTPUT_DIR/wwwroot..."
slcli webapp pack "$OUTPUT_DIR/wwwroot"

NIPKG="$OUTPUT_DIR/wwwroot.nipkg"

# ── 6. Publish to SystemLink ──────────────────────────────────────────────────
echo "==> Publishing '$WEBAPP_NAME' to workspace '$WORKSPACE'..."
PUBLISH_OUTPUT=$(slcli webapp publish "$NIPKG" --name "$WEBAPP_NAME" --workspace "$WORKSPACE")
echo "$PUBLISH_OUTPUT"

WEBAPP_ID=$(echo "$PUBLISH_OUTPUT" | grep -o 'Webapp ID: [a-f0-9-]*' | sed 's/Webapp ID: //')

echo ""
echo "Done! Webapp '$WEBAPP_NAME' published to workspace '$WORKSPACE'."

if [ -n "$WEBAPP_ID" ]; then
  echo "==> Opening webapp $WEBAPP_ID..."
  slcli webapp open --id "$WEBAPP_ID"
else
  echo "WARNING: Could not parse Webapp ID from publish output."
fi
