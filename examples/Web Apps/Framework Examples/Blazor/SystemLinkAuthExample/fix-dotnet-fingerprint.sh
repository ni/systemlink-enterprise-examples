#!/bin/bash
# Apply the dotnet.js fingerprint workaround for .NET 10 Blazor WASM apps.
#
# In .NET 10, dotnet.js is renamed with a fingerprint hash (e.g.
# dotnet.5y8w35dinf.js). ASP.NET Core middleware resolves the virtual path
# "_framework/dotnet.js" to the fingerprinted file at runtime, but static
# hosts (like SystemLink) serve files directly and require the
# un-fingerprinted name to exist on disk.
#
# Usage:
#   ./fix-dotnet-fingerprint.sh <publish-dir>
#
# Example:
#   ./fix-dotnet-fingerprint.sh pub

set -e

OUTPUT_DIR="${1:?Usage: ./fix-dotnet-fingerprint.sh <publish-dir>}"
OUTPUT_DIR="${OUTPUT_DIR%/}"

# ── 1. Locate the staticwebassets endpoints manifest ─────────────────────────
MANIFEST=$(find "$OUTPUT_DIR" -maxdepth 1 -name "*.staticwebassets.endpoints.json" | head -1)
if [ -z "$MANIFEST" ]; then
  echo "ERROR: No staticwebassets.endpoints.json found in $OUTPUT_DIR"
  exit 1
fi
echo "==> Manifest: $MANIFEST"

# ── 2. Find fingerprinted dotnet.js (exclude .br / .gz variants) ─────────────
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

# ── 3. Copy fingerprinted file to the un-fingerprinted virtual path ───────────
echo "==> Copying $DOTNET_JS_FINGERPRINTED -> dotnet.js"
cp "$OUTPUT_DIR/wwwroot/_framework/$DOTNET_JS_FINGERPRINTED" \
   "$OUTPUT_DIR/wwwroot/_framework/dotnet.js"
