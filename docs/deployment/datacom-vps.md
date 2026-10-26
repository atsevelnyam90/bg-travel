# BG Travel deployment on a Datacom VPS

## Project overview

- `portal/` is the only Next.js 16 application. The public website is at `/`, the administration area is at `/admin`, and sign-in is at `/auth/login`. There is no separate `admin/` application in this repository.
- `backend/` is an Express API under `/api/v1`. The `/api/v1/health` endpoint checks PostgreSQL.
- The database is PostgreSQL 17. The development `backend/docker-compose.yml` contains development credentials and Mailpit; **do not use it on the VPS**.
- The production stack in `deploy/compose.yml` runs PostgreSQL, MinIO, the API, the portal, and Nginx. PostgreSQL and MinIO have no public ports. Docker volumes `postgres-data`, `minio-data`, and `builder-files` retain database data, uploaded objects, and Builder images on the VPS.
- A note in the development Compose file recommends a managed database. The requested production setup uses PostgreSQL in Docker, so database recovery will be our responsibility.

## VPS status

On 23 October 2026, the VPS ran Ubuntu 24.04.2 LTS with about 7.2 GiB of available RAM and 152 GiB of free disk space before the application build. Docker Engine and Compose are installed. SSH key access for the dedicated `bgdeploy` user was verified, and deployment files are in `/opt/bgtravel`. PostgreSQL, MinIO, the API, portal, and Nginx run on the VPS with persistent Docker volumes. On 24 October 2026, the issued certificate and DigiCert intermediate were installed as `/opt/bgtravel/certs/fullchain.pem`; the matching private key remains on the VPS. HTTPS checks returned 200 for `www.bgtravel.mn/`, `/admin`, `/auth/login`, `/api/v1/health`, and the three required legacy CSS files. HTTP and the apex domain redirect to `https://www.bgtravel.mn/`. The certificate covers both hostnames and expires on 9 May 2027. Before the first automated release on 24 October 2026, the portal image was tagged `https-authfix-20261024` and the API image was tagged `https-live-20261024`. Those images were built manually on the VPS rather than from a GitHub Actions commit. The booking drawer's close button, backdrop, and Escape key were verified in a production browser after the earlier portal image update. A fresh browser session starting at `/admin` was verified to reach `/admin/dashboard` after login with the authentication fix. No obsolete BG Travel containers remain.

## Deployment flow

```text
merge or push to main → existing CI (tests, lint, build)
                      → .github/workflows/deploy.yml
                      → build API and portal images → GHCR (commit SHA tags)
                      → SSH to VPS → docker compose pull
                      → PostgreSQL backup → Prisma and Builder migrations → start containers
                      → API, page, and CSS smoke checks → record deployed commit SHA
```

The workflow publishes images only after `CI` succeeds for `main` in this repository. SSH deployment is enabled with the GitHub repository variable `DEPLOY_ENABLED=true`. Before migrations, deployment writes a PostgreSQL custom-format dump to `/opt/bgtravel/backups/`, checks its archive listing and contents, and stops if the dump fails. Deployment restarts Nginx after replacing application containers, then checks the API, public page, admin pages, and three required CSS URLs through the public hostname. If a check fails, `deploy/deploy.sh` attempts to restore the previous application images. These HTTP checks do not guarantee identical rendering or browser behavior, and database content can differ between local and production. **Database migrations are not rolled back**, so new migrations must remain compatible with the previous application version during a deployment.

Routine application deploys pull only the commit-tagged API and portal images. PostgreSQL, MinIO, and Nginx use already provisioned images, so an application deploy cannot silently upgrade them or wait on their registries. Provision those infrastructure images separately before the first deploy or a planned infrastructure upgrade.

The initial HTTP launch used `http-bootstrap` images built directly on the VPS from the local working tree. The first HTTPS images were also built manually. An early CI run failed at `pnpm/action-setup@v4` because this repository has no root `package.json`; the workflow now specifies pnpm `11.22.0` in both jobs. The workflow authenticates the VPS to GHCR with the current run's `GITHUB_TOKEN`, so a separate package access token is unnecessary when this repository has access to its packages.

The initial `http-bootstrap` portal image omitted `public/wp-content/themes/blacktomato/dist`, which caused its legacy CSS URLs to return 404 and made the homepage appear broken. When staging sources for a manual image build, exclude only top-level generated directories such as `/node_modules/` and `/.next/`; a broad `dist/` exclusion removes required files under `public/`. The portal Dockerfile now checks for the three required CSS files before building.

### GitHub Actions setup

In the repository's **Settings → Secrets and variables → Actions → Variables**, add:

| Name | Value |
|---|---|
| `VPS_HOST` | `202.131.1.116` |
| `VPS_USER` | `bgdeploy` |
| `DEPLOY_ENABLED` | `true` after the SSH secrets are configured |

In **Settings → Secrets and variables → Actions → Secrets**, add `VPS_SSH_PRIVATE_KEY` from the full contents of the ignored local file `deploy/.private/github-actions-ed25519`, and `VPS_SSH_KNOWN_HOSTS` from `deploy/.private/known_hosts`. Do not paste either value into a commit, issue, or chat. The workflow uses GitHub's automatic `GITHUB_TOKEN`; no secret for GHCR is required. If a `production` environment is configured in repository settings, leave required reviewers and wait timers disabled for immediate deployment after CI.

Commit and merge the pending deployment and CI files to `main` only after these settings are in place. The `CI` workflow must pass on that `main` commit; `Build and deploy` then publishes images and deploys that exact commit to the VPS. Inspect both workflow runs in the **Actions** tab and check `https://www.bgtravel.mn/api/v1/health` and the website. The deploy workflow must be present on the default branch for its `workflow_run` trigger to fire. If you initially leave `DEPLOY_ENABLED=false`, image publication still happens, but a later push to `main` is needed to trigger SSH deployment after enabling it.

`NEXT_PUBLIC_API_BASE_URL` is embedded in the portal image at build time; changing it requires a new build. The workflow now builds against `https://www.bgtravel.mn/api/v1` directly. The old GitHub `PUBLIC_API_BASE_URL` variable is no longer used and can be removed. The public site, administration area, API, and direct file uploads share one host. Nginx routes `/api/v1/` to the API, `/bgtravel-media/` to MinIO, and other requests to the portal.

## Temporary HTTP launch

`deploy/nginx/http-live.conf` was used before the certificate was installed. It also keeps `/.well-known/pki-validation/` available on both domain names. For a temporary HTTP-only launch, set `NGINX_CONFIG=http-live.conf` in `/opt/bgtravel/stack.env`; use `APP_URL=http://www.bgtravel.mn`, `S3_ENDPOINT=http://www.bgtravel.mn`, `S3_PUBLIC_URL=http://www.bgtravel.mn/bgtravel-media`, and an HTTP origin in `CORS_ORIGINS`. The portal image must be built with the matching HTTP `NEXT_PUBLIC_API_BASE_URL`. The current production configuration is HTTPS.

The production API marks session cookies `Secure` and `SameSite=None`, so browser sign-in cannot work over plain HTTP. Do not submit credentials, personal data, or payment details until HTTPS is active. After the certificate is installed, change the backend URLs and CORS origin to HTTPS, set `NGINX_CONFIG=https.conf`, and rebuild the portal image. `deploy/deploy.sh` accepts both live proxy configurations and checks the matching protocol.

## VPS preparation

1. Docker Engine and the Compose plugin were already installed using the [official Docker instructions for Ubuntu](https://docs.docker.com/engine/install/ubuntu/). Repeat this step only when provisioning a new VPS.
2. Create `/opt/bgtravel/{nginx,certs,pki-validation}` and copy the deployment scripts, Compose files, and Nginx configurations from `deploy/`. Create `/opt/bgtravel/stack.env` and `/opt/bgtravel/backend.env` from `deploy/stack.example` and `deploy/backend.example`, with file permissions set to `600`. Never commit the real configuration files.
3. In `stack.env`, set strong random passwords and `IMAGE_PREFIX=ghcr.io/atsevelnyam90/bg-travel`. In `backend.env`, use the matching PostgreSQL and MinIO credentials, `NODE_ENV=production`, a unique `SESSION_SECRET` of at least 32 characters, the owner's email address, and a strong `SEED_OWNER_PASSWORD`. URL-encode the password inside `DATABASE_URL`.
   On a new VPS, after the first application images have been published, pull infrastructure images once from `/opt/bgtravel` with `IMAGE_TAG=PASTE_FULL_40_CHARACTER_COMMIT_SHA_HERE docker compose --env-file stack.env -f compose.yml pull postgres minio proxy`. Routine application deploys do not refresh them.
4. For invitations and transactional email, configure a real `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, and verified `MAIL_FROM`. The development Mailpit service does not send email to the internet. The seeded owner can sign in without SMTP, but invitations will not work.
5. The SSH key for `bgdeploy` is already authorized on the VPS and sign-in has been verified. Its private part exists only in the ignored local file `deploy/.private/github-actions-ed25519`. Membership in the `docker` group effectively grants root access, so protect this key accordingly. Do not store the root password in GitHub Actions.
6. Configure the GitHub repository variables and secrets in **GitHub Actions setup** above. The workflow logs the VPS into GHCR before each pull using the job's `GITHUB_TOKEN`, which expires after the run. Verify the SSH host fingerprint through an independent channel before trusting it. If package access is denied, grant this repository Actions access to both GHCR packages in their package settings.
7. Allow inbound TCP ports 22 (preferably restricted to trusted addresses), 80, and 443. Do not expose PostgreSQL 5432, MinIO 9000, or application ports 3000 and 4000.

The GitHub workflow runs `bash /opt/bgtravel/deploy.sh <40-character-commit-SHA>` after publishing images. The script can deploy in either live HTTP or HTTPS mode. Then run `IMAGE_TAG=<SHA> docker compose --env-file stack.env -f compose.yml run --rm api pnpm db:seed` once from `/opt/bgtravel` if the production seed has not already been run. Production seeding rejects the default password. Automatic deployment intentionally does not run the seed because it can modify Builder definitions. After changing `PERMISSIONS`, review the effect on customized Builder definitions before running the seed again.

## Domain and Positive SSL

1. In Datacom DNS management, point an A record for `www.bgtravel.mn` to the VPS public IPv4 address. An A record for `bgtravel.mn` is also needed for HTTP validation of both names and for redirecting the apex domain to `www`. See [Datacom's A record guide](https://site.datacom.mn/mn/help/article/16). Any AAAA record must point to working IPv6 on this server; otherwise, remove it.
2. The Datacom order is for `bgtravel.mn`, so its panel rejected the original CSR for `www.bgtravel.mn`. That obsolete CSR has been deleted locally and from the VPS. The replacement CSR is the ignored local file `deploy/.private/bgtravel.mn.csr`. It was generated **on the VPS** with the existing private key at `/opt/bgtravel/certs/privkey.pem`; that key has not left the server. The CSR signature, common name `bgtravel.mn`, and SAN entries `DNS:bgtravel.mn` and `DNS:www.bgtravel.mn` were verified. To recreate the CSR with the same key:

   ```bash
   sudo install -d -m 700 /opt/bgtravel/certs
   sudo openssl req -new -key /opt/bgtravel/certs/privkey.pem \
     -out /opt/bgtravel/certs/bgtravel.mn.csr \
     -subj '/CN=bgtravel.mn' \
     -addext 'subjectAltName=DNS:bgtravel.mn,DNS:www.bgtravel.mn'
   ```

   [Datacom's CSR guide](https://manage.datacom.mn/knowledgebase/69/Certificate-Signing-Request-CSR-gej-yuu-ve.html) says to paste the CSR into **SSL Certificate → Issue Certificate**. Paste the complete contents of the new `.csr` file, **never** `privkey.pem`. The current validation challenge uses a DigiCert CNAME target, so do not assume that another CA's policy for automatically including `www` applies to this order. Check the SAN entries in the issued certificate before deploying it. If `www.bgtravel.mn` is missing, ask Datacom to include it or change the order to `www.bgtravel.mn`.
3. Complete the **DNS CNAME validation** requested by the Datacom panel. The current order's record is:

   | Field | Value |
   |---|---|
   | Type | `CNAME` |
   | Full hostname | `_dnsauth.bgtravel.mn` |
   | Host label in a `bgtravel.mn` zone editor | `_dnsauth` |
   | Target/value | `_0ve4hbg9ojw8iezfsmcq8gixdds57pf.dcv.digicert.com` |
   | TTL | `14400` seconds (4 hours), or the provider's preset value if fixed |

   Datacom's DNS editor may append `bgtravel.mn` to the host label automatically; check that the saved record is exactly `_dnsauth.bgtravel.mn`, not `_dnsauth.bgtravel.mn.bgtravel.mn`. Keep the target as a DNS hostname, without `https://`. If the editor appends the zone to target names, use a final dot after `digicert.com` to mark it as absolute. [DigiCert's CNAME DCV guide](https://docs.digicert.com/en/certcentral/perform-domain-control-validation--dcv-/validate-domains-before-or-during-certificate-orders/validate-domains-using-dns-validation-methods/add-and-validate-a-domain-using-dns-cname-record.html) specifies the `_dnsauth` host and a `dcv.digicert.com` target; [Datacom's DNS guide](https://support.datacom.mn/kb/servlet/KBServlet/faq471.html) lists `14400` seconds as its minimum CNAME TTL. Once the record propagates, verify it with `dig +short CNAME _dnsauth.bgtravel.mn`, then use the panel's validation check. The panel estimates 4–6 hours for propagation. This token belongs to the current order; use the latest panel value for any reissue or renewal.
4. The live HTTP proxy also serves `/.well-known/pki-validation/`. The separate validation container remains an alternative if Datacom changes the DCV method before the application starts: `docker compose -f /opt/bgtravel/compose.validation.yml up -d`. Use the exact filename, content, and hostname shown by the issuer; [DigiCert validates each HTTP hostname separately](https://docs.digicert.com/en/certcentral/perform-domain-control-validation--dcv-/validate-domains-before-or-during-certificate-orders/validate-domains-using-website-validation-methods/avoid-common-mistakes-with-http-practical-demonstration/place-the-file-on-the-correct-domain.html). Stop the separate validation container before starting the application proxy. No HTTP validation file or domain email is needed for the current CNAME method.
5. The issued server certificate and the official DigiCert RapidSSL TLS RSA CA G1 intermediate are concatenated in leaf-then-intermediate order in `/opt/bgtravel/certs/fullchain.pem`. The original `privkey.pem` used for the CSR remains on the VPS. Their public keys match, and a client TLS verification returns `Verify return code: 0 (ok)`. Renew the certificate before 9 May 2027, preserving the full chain and updating Nginx. Keep `fullchain.pem` and `privkey.pem` on the VPS; do not send the private key as an attachment.

## Data, backups, and remaining work

- Each deployment saves a PostgreSQL dump before migrations in `/opt/bgtravel/backups/`. It checks the archive listing and reads the full archive with `pg_restore` before deleting earlier automatic dumps. On success, only the newest automatic dump remains; if backup or validation fails, deploy stops and the previous dump remains. The directory mode is `700` and the file mode is `600`. On October 26, the VPS had about 146 GB free and a dump was 62 kB; dump size will grow with data. A new dump temporarily needs enough space alongside the previous one. This single local dump covers the pre-deploy database, not the state after migrations. It does not cover MinIO objects or the `builder-files` volume, and cannot protect against loss of the entire VPS. Test restoration separately before relying on it for recovery.
- The MinIO bucket permits anonymous reads only under `product/` and `avatar/` so public URLs work. `contract/` remains private; authorized downloads must be implemented before that scope is used. Current travel images uploaded through Builder are stored locally in the persistent `builder-files` volume.
- The owner requested the same temporary demo travel as local development. `Вьетнам 3 хот аялал` (`vietnam-three-cities`) was seeded directly into the production database on 24 October 2026 with four departures and eight itinerary days. `seedTravelDemo()` only inserts missing records and respects a soft-deleted demo travel. The public `/api/v1/public/travels` endpoint now returns this travel. Do not run the full production seed just to restore the demo, because it also updates roles and Builder definitions.
- The one-time `20261026190000_backfill_existing_demo_travel_sections` migration fills missing demo labels and creates the three itinerary sections only when the existing, non-deleted demo has no section records. It links only ungrouped, non-deleted day records. Existing editor-managed values and deleted sections are preserved.
- Keep `DEPLOY_ENABLED=true`, `NGINX_CONFIG=https.conf`, and the HTTPS API build argument for subsequent deployments.
