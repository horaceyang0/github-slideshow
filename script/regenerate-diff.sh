#!/usr/bin/env bash
# Regenerate a patch for the study app files in the local repo without relying on external hosting.
set -euo pipefail

# default revision range: previous commit to HEAD
BASE_REF=${1:-HEAD^}
TARGET_REF=${2:-HEAD}
OUTPUT_PATH=${3:-./local-study-app.diff}

FILES=(
  .gitignore
  README.md
  study-app.html
  script/pdfjs/README.txt
  desktop-app/main.js
  desktop-app/package.json
  desktop-app/preload.js
)

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Base ref '$BASE_REF' is not valid" >&2
  exit 1
fi

if ! git rev-parse --verify "$TARGET_REF" >/dev/null 2>&1; then
  echo "Target ref '$TARGET_REF' is not valid" >&2
  exit 1
fi

git diff "$BASE_REF" "$TARGET_REF" -- "${FILES[@]}" > "$OUTPUT_PATH"

if [ -s "$OUTPUT_PATH" ]; then
  echo "Wrote diff to $OUTPUT_PATH"
else
  echo "No changes captured for the selected files between $BASE_REF and $TARGET_REF" >&2
fi
