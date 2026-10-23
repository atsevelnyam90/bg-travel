#!/usr/bin/env bash
set -euo pipefail

cd /opt/bgtravel

image_tag="${1:?usage: deploy.sh <git-sha>}"
if [[ ! "$image_tag" =~ ^[a-f0-9]{40}$ ]]; then
  echo "Expected a full Git commit SHA" >&2
  exit 1
fi

if [[ ! -f stack.env || ! -f backend.env ]]; then
  echo "stack.env and backend.env must be provisioned on the VPS" >&2
  exit 1
fi

if grep -qx 'NGINX_CONFIG=http-live.conf' stack.env; then
  site_scheme=http
  site_port=80
elif grep -qx 'NGINX_CONFIG=https.conf' stack.env; then
  if [[ ! -s certs/fullchain.pem || ! -s certs/privkey.pem ]]; then
    echo "TLS certificate or private key is missing" >&2
    exit 1
  fi
  site_scheme=https
  site_port=443
else
  echo "Set NGINX_CONFIG to http-live.conf or https.conf" >&2
  exit 1
fi

compose() {
  IMAGE_TAG="$image_tag" docker compose --env-file stack.env -f compose.yml "$@"
}

previous_tag=""
if [[ -f .deployed-tag ]]; then
  previous_tag="$(cat .deployed-tag)"
fi

restore_previous_images() {
  if [[ -z "$previous_tag" ]]; then
    return
  fi

  echo "Restoring previous application images" >&2
  IMAGE_TAG="$previous_tag" docker compose --env-file stack.env -f compose.yml up -d --wait api portal proxy || true
  # Nginx resolves the application container names when it starts.
  docker compose --env-file stack.env -f compose.yml restart proxy || true
}

check_public_path() {
  local path="$1"
  curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-all-errors \
    --connect-timeout 5 --max-time 15 \
    --resolve "www.bgtravel.mn:${site_port}:127.0.0.1" \
    "${site_scheme}://www.bgtravel.mn${path}" >/dev/null
}

compose pull postgres minio api portal proxy
compose up -d --wait postgres minio
compose run --rm -e S3_ENDPOINT=http://minio:9000 api node scripts/create-production-bucket.mjs
compose run --rm api pnpm db:deploy
compose run --rm api pnpm builder:migrate

# The validation-only Nginx occupies port 80 until the application proxy takes over.
docker compose -f compose.validation.yml down

if ! compose up -d --wait api portal proxy; then
  echo "New containers failed health checks" >&2
  restore_previous_images
  exit 1
fi

if ! compose restart proxy; then
  echo "Proxy restart failed" >&2
  restore_previous_images
  exit 1
fi

public_paths=(
  /api/v1/health
  /
  /admin
  /auth/login
  /wp-content/themes/blacktomato/dist/css/base.css
  /wp-content/themes/blacktomato/dist/css/current.css
  /wp-content/themes/blacktomato/dist/css/home-inline.css
)
for path in "${public_paths[@]}"; do
  if ! check_public_path "$path"; then
    echo "Public smoke check failed: $path" >&2
    restore_previous_images
    exit 1
  fi
done

printf '%s\n' "$image_tag" > .deployed-tag
echo "Deployed $image_tag"
