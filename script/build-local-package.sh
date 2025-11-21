#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR_NAME="${1:-local-dist}"
DIST_DIR="${ROOT_DIR}/${OUTPUT_DIR_NAME%/}"
PDFJS_VERSION="${PDFJS_VERSION:-3.9.179}"
INCLUDE_DESKTOP="${INCLUDE_DESKTOP:-false}"

mkdir -p "${DIST_DIR}/script/pdfjs"

copy_if_exists() {
  local src="$1" dest="$2"
  if [[ -f "${src}" ]]; then
    cp "${src}" "${dest}"
  fi
}

# Copy main HTML and helper docs
cp "${ROOT_DIR}/study-app.html" "${DIST_DIR}/study-app.html"
copy_if_exists "${ROOT_DIR}/script/pdfjs/README.txt" "${DIST_DIR}/script/pdfjs/README.txt"

fetch_pdfjs() {
  local name="$1"
  local base="${PDFJS_MIRROR:-https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}}"
  local url="${base}/build/${name}"
  local dest="${DIST_DIR}/script/pdfjs/${name}"
  if [[ -f "${dest}" ]]; then
    echo "[skip] ${name} already exists"
    return
  fi
  echo "[fetch] ${name} from ${url}"
  if curl -L "${url}" -o "${dest}"; then
    echo "[ok] saved to ${dest}"
  else
    echo "[warn] failed to fetch ${name}; please download manually into ${dest}" >&2
    rm -f "${dest}"
  fi
}

fetch_pdfjs "pdf.min.js"
fetch_pdfjs "pdf.worker.min.js"

if [[ "${INCLUDE_DESKTOP}" == "true" ]]; then
  echo "[copy] desktop-app scaffolding"
  rsync -a --exclude node_modules "${ROOT_DIR}/desktop-app/" "${DIST_DIR}/desktop-app/"
fi

if command -v zip >/dev/null 2>&1; then
  ARCHIVE_PATH="${DIST_DIR%/}.zip"
  echo "[zip] creating ${ARCHIVE_PATH}"
  (cd "${ROOT_DIR}" && zip -qr "${ARCHIVE_PATH}" "${OUTPUT_DIR_NAME%/}")
else
  echo "[warn] zip not found; skipped archive creation"
fi

echo "Local package is ready at ${DIST_DIR}" \
  && [[ -f "${DIST_DIR%/}.zip" ]] && echo "Archive: ${DIST_DIR%/}.zip" || true
