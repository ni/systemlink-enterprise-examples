#!/bin/bash

echo "Building dist/"
npm run build

WEBAPP_NAME=$(basename $PWD)

slcli webapp pack dist/ --output "${WEBAPP_NAME}.nipkg"

echo "Created ${WEBAPP_NAME}.nipkg"

DEVELOPER_UNAME=$(basename ~)
WEBAPP_PUBLISH_NAME="${DEVELOPER_UNAME}_DEV_${WEBAPP_NAME}"

WORKSPACE=BYU2026

echo "**PUBLISHING  webapp to ${WORKSPACE} as ${WEBAPP_PUBLISH_NAME}"

WEBAPP_ID=$(slcli webapp list --workspace "$WORKSPACE" --filter "$WEBAPP_PUBLISH_NAME" --format json | jq -r '.[0].id //empty')


if [[ -z "$WEBAPP_ID" ]]; then
  echo "**WEBAPP_ID =${WEBAPP_ID}"
  echo "**Webapp does not exist -- publishing new"
  slcli webapp publish "${WEBAPP_NAME}.nipkg" --name "$WEBAPP_PUBLISH_NAME" --workspace "$WORKSPACE" 
else
  echo "**Webapp exists: -- updating"
  WEBAPP_ID=$(slcli webapp publish "${WEBAPP_NAME}.nipkg" --id "$WEBAPP_ID") | awk '/Webapp ID:/ {print $3}'
fi

echo "Cleanup."
echo "Removing ${WEBAPP_NAME}.nipkg"
rm "${WEBAPP_NAME}.nipkg"

echo "Removing dist/"

rm -r dist/

slcli webapp open --id "${WEBAPP_ID}"

# echo "To open in Sl website run 'slcli webapp open --id "${WEBAPP_ID}"'"