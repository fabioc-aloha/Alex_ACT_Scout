#!/usr/bin/env bash
set -euo pipefail

registry_path="${HOME}/.scout/m-mcp-servers.json"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
launcher_path="${script_dir}/runtime-launcher.mjs"
apply=0

usage() {
  cat <<'USAGE'
Usage: ./register-flint-mcp.sh [--registry-path PATH] [--launcher-path PATH] [--apply] [--help]

Registers the Flint MCP launcher in Scout's local MCP registry.
Dry-run mode is used unless --apply is supplied.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --registry-path)
      registry_path="$2"
      shift 2
      ;;
    --launcher-path)
      launcher_path="$2"
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

if ! command -v node >/dev/null 2>&1; then
  echo "node is required but was not found on PATH." >&2
  exit 1
fi

if [[ ! -f "${launcher_path}" ]]; then
  if [[ "${apply}" -eq 0 ]]; then
    echo "Would use runtime launcher after visual skill install: ${launcher_path}"
  else
    echo "Missing runtime launcher: ${launcher_path}" >&2
    exit 1
  fi
fi

tmp_file="$(mktemp)"
node - "${registry_path}" "${launcher_path}" > "${tmp_file}" <<'NODE'
const fs = require('node:fs');
const [registryPath, launcherPath] = process.argv.slice(2);
let registry = { servers: {} };
if (fs.existsSync(registryPath)) {
  registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}
if (!registry.servers || typeof registry.servers !== 'object') {
  registry.servers = {};
}
registry.servers.flint = {
  builtin: false,
  config: {
    name: 'flint',
    type: 'command',
    command: 'node',
    args: [launcherPath, 'flint']
  },
  tools: []
};
process.stdout.write(JSON.stringify(registry, null, 2) + '\n');
NODE

if [[ "${apply}" -eq 0 ]]; then
  echo "DRY RUN: no files will be changed. Re-run with --apply to register."
  echo "Would update registry: ${registry_path}"
  echo "Would set flint launcher: ${launcher_path}"
  cat "${tmp_file}"
  rm -f "${tmp_file}"
  exit 0
fi

mkdir -p "$(dirname "${registry_path}")"
if [[ -f "${registry_path}" ]]; then
  cp "${registry_path}" "${registry_path}.bak-$(date +%Y%m%d-%H%M%S)"
fi
mv "${tmp_file}" "${registry_path}"

echo "Registered Flint MCP in ${registry_path}"
echo "Restart Scout so the MCP tool inventory refreshes."
