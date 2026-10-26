#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
test_dir="$(mktemp -d)"
trap 'rm -rf -- "$test_dir"' EXIT
export BACKUP_DIR="$test_dir/backups"
mkdir -p "$BACKUP_DIR"

old_sha="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
new_sha="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
old_backup="$BACKUP_DIR/pre-migration-20261026T000000Z-$old_sha-123.dump"
manual_backup="$BACKUP_DIR/pre-migration-manual.dump"
printf 'previous backup\n' > "$old_backup"
printf 'manual backup\n' > "$manual_backup"

docker() {
  if [[ "$*" == *"pg_dump -U bgtravel -d bgtravel --format=custom"* ]]; then
    [[ "$MOCK_MODE" != "dump_fail" ]] || return 1
    printf 'PGDMPtest\n'
  elif [[ "$*" == *"pg_restore --list"* ]]; then
    local header
    IFS= read -r header
    [[ "$header" == "PGDMPtest" && "$MOCK_MODE" != "list_fail" ]]
  elif [[ "$*" == *"pg_restore --file=/dev/null"* ]]; then
    local header
    IFS= read -r header
    [[ "$header" == "PGDMPtest" && "$MOCK_MODE" != "extract_fail" ]]
  else
    return 1
  fi
}
export -f docker

for MOCK_MODE in dump_fail list_fail extract_fail; do
  export MOCK_MODE
  if bash ./backup-db.sh "$new_sha" > /dev/null 2>&1; then
    echo "Backup should fail when $MOCK_MODE" >&2
    exit 1
  fi
  [[ -f "$old_backup" && -f "$manual_backup" ]]
  shopt -s nullglob
  backups=("$BACKUP_DIR"/pre-migration-*.dump)
  [[ "${#backups[@]}" -eq 2 ]]
done

export MOCK_MODE=success
bash ./backup-db.sh "$new_sha" > /dev/null
shopt -s nullglob
backups=("$BACKUP_DIR"/pre-migration-*.dump)
[[ "${#backups[@]}" -eq 2 ]]
[[ ! -e "$old_backup" && -f "$manual_backup" ]]
[[ "${backups[0]}" == *"$new_sha"* || "${backups[1]}" == *"$new_sha"* ]]
echo "Backup rotation preserves the previous dump on failure and keeps one new automatic dump on success"
