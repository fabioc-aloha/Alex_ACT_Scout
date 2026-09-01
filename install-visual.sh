#!/usr/bin/env bash
set -euo pipefail

destination="${HOME}/.scout/skills"
apply=0
force=0
setup_flint_mcp=0
register_flint_mcp=0
npm_registry=""

usage() {
  cat <<'USAGE'
Usage: ./install-visual.sh [--destination PATH] [--apply] [--force] [--setup-flint-mcp] [--register-flint-mcp] [--with-flint-mcp] [--npm-registry URL] [--help]

Options:
  --destination PATH                  Install into a custom Scout skills folder.
  --apply                             Apply changes. Without this flag, dry-run mode is used.
  --force                             Overwrite existing visual skill folders when applying.
  --setup-flint-mcp                   Also run the Flint runtime setup step.
  --register-flint-mcp                Also register Flint in Scout's MCP registry.
  --with-flint-mcp                    Shortcut for --setup-flint-mcp --register-flint-mcp.
  --npm-registry URL                  Use this npm registry for Flint runtime setup only.
  -h, --help                          Show this help.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --destination)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --destination" >&2
        exit 2
      fi
      destination="$2"
      shift 2
      ;;
    --apply)
      apply=1
      shift
      ;;
    --force)
      force=1
      shift
      ;;
    --setup-flint-mcp)
      setup_flint_mcp=1
      shift
      ;;
    --register-flint-mcp)
      register_flint_mcp=1
      shift
      ;;
    --with-flint-mcp)
      setup_flint_mcp=1
      register_flint_mcp=1
      shift
      ;;
    --npm-registry)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --npm-registry" >&2
        exit 2
      fi
      npm_registry="$2"
      shift 2
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

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skills_root="${script_dir}/skills-visual"

if [[ ! -d "${skills_root}" ]]; then
  echo "Missing visual skills directory: ${skills_root}" >&2
  exit 1
fi

if [[ -z "${destination}" || "${destination}" == "/" ]]; then
  echo "Refusing to install into an empty path or filesystem root: ${destination}" >&2
  exit 2
fi

if [[ "${apply}" -eq 0 ]]; then
  echo "DRY RUN: no files will be changed. Re-run with --apply to install."
else
  echo "APPLY: installing visual skills into ${destination}"
fi

if [[ ! -d "${destination}" ]]; then
  if [[ "${apply}" -eq 0 ]]; then
    echo "Would create destination: ${destination}"
  else
    mkdir -p "${destination}"
  fi
fi

installed=0
skipped=0

for skill_dir in "${skills_root}"/*; do
  [[ -d "${skill_dir}" ]] || continue

  skill_name="$(basename "${skill_dir}")"
  target="${destination}/${skill_name}"

  if [[ -e "${target}" && "${force}" -eq 0 ]]; then
    echo "Skipping existing visual skill: ${skill_name} (use --force to overwrite)"
    skipped=$((skipped + 1))
    continue
  fi

  if [[ "${apply}" -eq 0 ]]; then
    if [[ -e "${target}" ]]; then
      echo "Would overwrite visual skill: ${skill_name}"
    else
      echo "Would install visual skill: ${skill_name}"
    fi
  else
    if [[ -e "${target}" ]]; then
      rm -rf "${target}"
    fi
    cp -R "${skill_dir}" "${target}"
    echo "Installed visual skill: ${skill_name}"
  fi
  installed=$((installed + 1))
done

if [[ "${apply}" -eq 0 ]]; then
  echo "Dry run complete: would install/overwrite ${installed} visual skill(s), skip ${skipped} existing visual skill(s). Re-run with --apply to make changes."
else
  echo "Installed ${installed} visual skill(s); skipped ${skipped} existing visual skill(s). Restart Scout to refresh the skill list."
fi

if [[ "${setup_flint_mcp}" -eq 1 ]]; then
  setup_script="${skills_root}/flint-chart-mcp/scripts/setup-flint-runtime.sh"
  if [[ ! -f "${setup_script}" ]]; then
    echo "Missing Flint setup script: ${setup_script}" >&2
    exit 1
  fi

  setup_args=()
  if [[ -n "${npm_registry}" ]]; then
    setup_args+=(--npm-registry "${npm_registry}")
  fi
  if [[ "${apply}" -eq 1 ]]; then
    setup_args+=(--apply)
  fi
  "${setup_script}" "${setup_args[@]}"
fi

if [[ "${register_flint_mcp}" -eq 1 ]]; then
  register_script="${skills_root}/flint-chart-mcp/scripts/register-flint-mcp.sh"
  launcher_path="${destination}/flint-chart-mcp/scripts/runtime-launcher.mjs"
  if [[ ! -f "${register_script}" ]]; then
    echo "Missing Flint registration script: ${register_script}" >&2
    exit 1
  fi

  if [[ "${apply}" -eq 0 ]]; then
    "${register_script}" --launcher-path "${launcher_path}"
  else
    "${register_script}" --launcher-path "${launcher_path}" --apply
  fi
fi
