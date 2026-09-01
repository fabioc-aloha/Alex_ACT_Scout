#!/usr/bin/env bash
set -euo pipefail

# install.sh copies Alex ACT Scout skill folders into Scout's custom-skill
# directory on macOS/Linux. The default mirrors Scout's Unix-style config path.
destination="${HOME}/.scout/skills"
apply=0
force=0

usage() {
  cat <<'USAGE'
Usage: ./install.sh [--destination PATH] [--apply] [--force]

Options:
  --destination PATH                  Install into a custom Scout skills folder.
  --apply                             Apply changes. Without this flag, dry-run mode is used.
  --force                             Overwrite existing skill folders when applying.
  -h, --help                          Show this help.

Examples:
  ./install.sh
  ./install.sh --apply
  ./install.sh --apply --force
  ./install.sh --destination "$HOME/ScoutSkills" --apply
USAGE
}

# Parse long-form flags to keep the script readable and portable.
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

# Resolve paths from the script location so the command works from any cwd.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skills_root="${script_dir}/skills"

if [[ ! -d "${skills_root}" ]]; then
  echo "Missing skills directory: ${skills_root}" >&2
  exit 1
fi

if [[ -z "${destination}" || "${destination//\/}" == "" ]]; then
  echo "Refusing to install into an empty path or filesystem root: ${destination}" >&2
  exit 2
fi

if [[ "${apply}" -eq 0 ]]; then
  echo "DRY RUN: no files will be changed. Re-run with --apply to install."
else
  echo "APPLY: installing skills into ${destination}"
fi

# Ensure Scout's skill folder exists before cleanup or copy operations. In dry
# run mode, only report that the folder would be created.
if [[ ! -d "${destination}" ]]; then
  if [[ "${apply}" -eq 0 ]]; then
    echo "Would create destination: ${destination}"
  else
    mkdir -p "${destination}"
  fi
fi

installed=0
skipped=0
removed=0

# The current package stores source prompts/instructions as resources under
# related skills, so always remove stale top-level folders if they are present.
if [[ -d "${destination}" ]]; then
  while IFS= read -r -d '' legacy_skill; do
    if [[ "${apply}" -eq 0 ]]; then
      echo "Would remove legacy top-level converted skill: $(basename "${legacy_skill}")"
    else
      rm -rf "${legacy_skill}"
      echo "Removed legacy top-level converted skill: $(basename "${legacy_skill}")"
    fi
    removed=$((removed + 1))
  done < <(find "${destination}" -mindepth 1 -maxdepth 1 -type d \( -name 'alex-instruction-*' -o -name 'alex-prompt-*' \) -print0)
fi

# These source skills are not shipped, and the retired message-bus capabilities
# have been removed from the package. Remove leftovers from older installs.
if [[ -d "${destination}" ]]; then
  for obsolete_skill in browser-tools platform-awareness scout-message-bus scout-message-bus-heartbeat; do
    obsolete_path="${destination}/${obsolete_skill}"
    if [[ -d "${obsolete_path}" ]]; then
      if [[ "${apply}" -eq 0 ]]; then
        echo "Would remove obsolete VS Code-specific skill: ${obsolete_skill}"
      else
        rm -rf "${obsolete_path}"
        echo "Removed obsolete VS Code-specific skill: ${obsolete_skill}"
      fi
      removed=$((removed + 1))
    fi
  done
fi

# Copy every current top-level skill folder. Existing skills are protected by
# default so user edits are not overwritten unless --force is supplied. A plain
# glob keeps this portable across macOS and Linux without GNU-only sort flags.
for skill_dir in "${skills_root}"/*; do
  [[ -d "${skill_dir}" ]] || continue

  skill_name="$(basename "${skill_dir}")"
  target="${destination}/${skill_name}"

  if [[ -e "${target}" && "${force}" -eq 0 ]]; then
    echo "Skipping existing skill: ${skill_name} (use --force to overwrite)"
    skipped=$((skipped + 1))
    continue
  fi

  if [[ "${apply}" -eq 0 ]]; then
    if [[ -e "${target}" ]]; then
      echo "Would overwrite skill: ${skill_name}"
    else
      echo "Would install skill: ${skill_name}"
    fi
  else
    if [[ -e "${target}" ]]; then
      rm -rf "${target}"
    fi

    cp -R "${skill_dir}" "${target}"
    echo "Installed skill: ${skill_name}"
  fi
  installed=$((installed + 1))
done

if [[ "${apply}" -eq 0 ]]; then
  echo "Dry run complete: would install/overwrite ${installed} skill(s), skip ${skipped} existing skill(s), remove ${removed} stale skill(s). Re-run with --apply to make changes."
else
  echo "Installed ${installed} skill(s); skipped ${skipped} existing skill(s); removed ${removed} stale skill(s). Restart Scout to refresh the skill list."
fi
