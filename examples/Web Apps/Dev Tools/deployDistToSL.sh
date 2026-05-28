#!/bin/bash

# -------------------------------
# Usage:
# ./deployDistToSL.sh <workspace> [dist_dir]
# Example:
# ./deployDistToSL.sh MY_WORKSPACE
# ./deployDistToSL.sh MY_WORKSPACE build_output
# -------------------------------
# [dist_dir] defaults to dist if not specified

# Exit immediately if a command fails, treat unset variables as errors, fail in pipelines
set -euo pipefail

# Check if slcli is installed
if ! command -v slcli &> /dev/null; then
  echo "Error: slcli is not installed. Please install it first."
  exit 1
fi

# Get workspace from first argument
WORKSPACE="$1"

# Validate workspace argument
if [[ -z "$WORKSPACE" ]]; then
  echo "Usage: $0 <workspace> [dist_dir]"
  exit 1
fi

# Get dist folder from second argument, default to 'dist'
DIST_DIR="${2:-dist}"

# Ensure dist directory exists
if [[ ! -d "$DIST_DIR" ]]; then
  echo "Error: dist directory '$DIST_DIR' does not exist!"
  exit 1
fi

WEBAPP_NAME=$(basename "$PWD")

# Package the webapp
echo "** Packaging webapp from $DIST_DIR"
slcli webapp pack "$DIST_DIR" --output "${WEBAPP_NAME}.nipkg"
echo "Created ${WEBAPP_NAME}.nipkg"

DEVELOPER_UNAME=$(basename "$HOME")
WEBAPP_PUBLISH_NAME="${DEVELOPER_UNAME}_DEV_${WEBAPP_NAME}"

echo "** PUBLISHING webapp to $WORKSPACE as $WEBAPP_PUBLISH_NAME"

# Check if the webapp already exists
WEBAPP_ID=$(slcli webapp list --workspace "$WORKSPACE" --filter "$WEBAPP_PUBLISH_NAME" --format json | jq -r '.[0].id // empty')

if [[ -z "$WEBAPP_ID" ]]; then
  echo "** Webapp does not exist -- publishing new"
  WEBAPP_ID=$(slcli webapp publish "${WEBAPP_NAME}.nipkg" --name "$WEBAPP_PUBLISH_NAME" --workspace "$WORKSPACE" | awk '/Webapp ID:/ {print $3}')
else
  echo "** Webapp exists -- updating"
  WEBAPP_ID=$(slcli webapp publish "${WEBAPP_NAME}.nipkg" --id "$WEBAPP_ID" | awk '/Webapp ID:/ {print $3}')
fi


# Open webapp
echo "** Opening webapp with ID $WEBAPP_ID"
slcli webapp open --id "$WEBAPP_ID"