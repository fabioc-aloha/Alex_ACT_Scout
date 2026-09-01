#!/usr/bin/env bash
set -euo pipefail

runtime_root="${HOME}/.scout/plugin-data/alex-act-scout/flint-runtime"
package_version="0.5.0"
npm_registry=""
apply=0

usage() {
  cat <<'USAGE'
Usage: ./setup-flint-runtime.sh [--runtime-root PATH] [--package-version VERSION] [--npm-registry URL] [--apply] [--help]

Installs flint-chart-mcp into a Scout-owned local runtime folder.
Dry-run mode is used unless --apply is supplied.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --runtime-root)
      runtime_root="$2"
      shift 2
      ;;
    --package-version)
      package_version="$2"
      shift 2
      ;;
    --npm-registry)
      npm_registry="$2"
      shift 2
      ;;
    --apply)
      apply=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "${runtime_root}" || "${runtime_root}" == "/" ]]; then
  echo "Refusing to install into an empty path or filesystem root: ${runtime_root}" >&2
  exit 2
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found on PATH." >&2
  exit 1
fi

package_spec="flint-chart-mcp@${package_version}"
if [[ -n "${npm_registry}" ]]; then
  registry="${npm_registry}"
else
  registry="$(npm config get registry)"
fi

if [[ "${apply}" -eq 0 ]]; then
  echo "DRY RUN: no files will be changed. Re-run with --apply to install."
else
  echo "APPLY: installing ${package_spec} into ${runtime_root}"
fi

echo "npm: $(command -v npm)"
echo "npm registry: ${registry}"
echo "runtime root: ${runtime_root}"
echo "package: ${package_spec}"

if [[ "${apply}" -eq 0 ]]; then
  echo "Would create runtime folder: ${runtime_root}"
  echo "Would run: npm install --prefix \"${runtime_root}\" --save-exact \"${package_spec}\" --registry \"${registry}\""
  exit 0
fi

mkdir -p "${runtime_root}"
npm install --prefix "${runtime_root}" --save-exact "${package_spec}" --registry "${registry}"

cli_path="${runtime_root}/node_modules/flint-chart-mcp/dist/cli.js"
if [[ ! -f "${cli_path}" ]]; then
  echo "Expected Flint MCP CLI was not installed: ${cli_path}" >&2
  exit 1
fi

echo "Installed Flint MCP CLI: ${cli_path}"
