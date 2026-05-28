#!/bin/bash
# Deploy Blazor WASM app to SystemLink.
#
# The dotnet.js fingerprint workaround is applied automatically during
# publish via the AfterTargets="Publish" MSBuild target in the .csproj.
# To apply the workaround without deploying, run fix-dotnet-fingerprint.sh.
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

# ── 2. Pack wwwroot ───────────────────────────────────────────────────────────
echo "==> Packing $OUTPUT_DIR/wwwroot..."
slcli webapp pack "$OUTPUT_DIR/wwwroot"

NIPKG="$OUTPUT_DIR/wwwroot.nipkg"

# ── 3. Publish to SystemLink ──────────────────────────────────────────────────
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
