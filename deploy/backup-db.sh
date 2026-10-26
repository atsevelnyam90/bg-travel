#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
umask 077

image_tag="${1:?usage: backup-db.sh <git-sha>}"
if [[ ! "$image_tag" =~ ^[a-f0-9]{40}$ ]]; then
  echo "Expected a full Git commit SHA" >&2
  exit 1
fi

backup_dir="${BACKUP_DIR:-/opt/bgtravel/backups}"
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
backup_file="$backup_dir/pre-migration-$(date -u +%Y%m%dT%H%M%SZ)-$image_tag-$$.dump"
temporary_file="$(mktemp "$backup_dir/.pre-migration.XXXXXXXX")"
trap 'rm -f "$temporary_file"' EXIT

# Use the running PostgreSQL container so pg_dump matches the server version.
docker compose --env-file stack.env -f compose.yml exec -T postgres \
  pg_dump -U bgtravel -d bgtravel --format=custom > "$temporary_file"
if [[ ! -s "$temporary_file" ]]; then
  echo "Database backup is empty; deployment stopped before migrations" >&2
  exit 1
fi
docker compose --env-file stack.env -f compose.yml exec -T postgres \
  pg_restore --list < "$temporary_file" > /dev/null

mv "$temporary_file" "$backup_file"
trap - EXIT
echo "Pre-migration database backup: $backup_file"
