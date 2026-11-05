# Maxicar Single-Project Architecture

## Goal

Use the Vercel project `maxicar-site` as the only Vercel project that builds and runs the new Maxicar website and its application-specific backend capabilities.

The existing live website at `maxicar.ir` is out of scope and must remain unchanged during this migration.

## Current inventory (verified 2026-11-05)

### Vercel projects

| Project | Framework | Latest deployment | Finding |
|---|---|---|---|
| `maxicar-site` | Next.js | READY | Target project. Preview deployment protection is enabled. |
| `maxicar-ai-core` | Express | ERROR | Latest build failed because configured root directory `maxicar-ai-core` does not exist in the connected repository. |
| `maxicar-staging-api` | Not detected | ERROR | Latest build failed because configured root directory `maxicar-staging-api` does not exist in the connected repository. |

All three Vercel projects currently point to the GitHub repository `parsazia/maxicar-site`. The latest campaign-branch builds of the two auxiliary projects failed because their configured root folders were absent from that branch. Earlier feature branches did contain those folders and produced READY deployments.

The two auxiliary Vercel projects now have the Ignored Build Step set to `exit 0`, so future commits to the shared repository are skipped there. Their project records and environment variables are retained for recovery and rollback until migration verification is complete.

### Existing application code observed on `feat/maxicar-campaign-stories`

- Next.js App Router website pages.
- Customer authentication routes backed by Supabase Auth.
- Cashback customer requests and administrator review routes.
- Campaign listing and administrator campaign management routes.
- Shared server modules for Supabase access, authorization, cashback, and campaign logic.

These capabilities already belong inside the Next.js application and should remain there.

### Recovered auxiliary source code

- `feat/maxicar-management-mcp`: `maxicar-ai-core/src/server.js` contains the Preview-only Express MCP bridge. Its current implementation exposes only `list_products` and `get_product`; product create/update tools were removed and all upstream calls are GET-only.
- `feat/maxicar-staging-api`: `maxicar-staging-api/api/[...path].js` contains the Preview-only, read-only catalog gateway. It permits only the product collection and numeric product-detail routes, uses a server-side source key, and rejects writes.
- Both source implementations have been moved into the Next.js application: `lib/maxicar-catalog-server.js`, `app/api/mcp/route.js`, `app/api/v4/products/route.js`, `app/api/v4/products/[id]/route.js`, and `app/api/health/route.js`.
- `lib/mixin.js` now uses the internal server adapter for product reads. The old cross-project `MAXICAR_STAGING_API_BASE_URL` dependency has been removed from catalog reads.
- The MCP and compatibility catalog endpoints use the same Preview-only bridge credential (`MAXICAR_BRIDGE_TOKEN`). Upstream catalog reads use `MAXICAR_SOURCE_API_KEY` and remain GET-only.

### Environment configuration observations

Only variable names, targets, and non-secret metadata were inspected. Secret values were not requested or copied.

- `maxicar-site` Preview currently contains `SUPABASE_URL`, `MAXICAR_STAGING_API_BASE_URL`, and a sensitive `MAXICAR_API_KEY`. The latter is intentionally not reused because its meaning is ambiguous and it may be an operational key.
- The site code requires `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in addition to `SUPABASE_URL`; these two keys were not present in the returned site environment-variable inventory.
- `maxicar-ai-core` Preview has `MAXICAR_API_BASE_URL`, `MAXICAR_PRODUCTS_PATH`, `MAXICAR_BRIDGE_TOKEN`, and a sensitive `MAXICAR_API_KEY`.
- `maxicar-staging-api` Preview has sensitive `MAXICAR_SOURCE_API_KEY` and `MAXICAR_STAGING_API_KEY`.
- The consolidated application now needs `MAXICAR_BRIDGE_TOKEN` and `MAXICAR_SOURCE_API_KEY` in the target project's Preview environment. The Vercel connection did not expose the existing secret values for transfer, even when requesting decryption; they have not been copied.
- The old `MAXICAR_STAGING_API_BASE_URL` is no longer used by the catalog-read code. It can be removed after the final dependency scan.
- Pricing writes remain separately guarded by `MAXICAR_PRICING_API_BASE_URL` and `MAXICAR_PRICING_API_KEY`; these must point to a dedicated non-production sandbox. They were not present in the inspected site environment and price writes must remain locked until configured and verified.

Secret values were not printed or committed. Never reuse the ambiguous `MAXICAR_API_KEY` on the site as the catalog source key or as the bridge token.

## Target architecture

Keep one Vercel project: `maxicar-site`.

- Website pages and UI: Next.js App Router.
- Application backend: Next.js Route Handlers under `app/api/**/route.js`.
- Shared server-only logic: modules under `lib/server/**` (or another clearly server-only location).
- Supabase: external managed database/auth service, connected directly from server-side application code.
- Maxicar/Mixin API integration: server-side adapter inside this application; never expose upstream credentials to the browser.
- AI content operations: server-side modules and protected API routes inside this application.
- Pricing and scheduled operations: internal server modules/routes and Vercel-native scheduling where appropriate.
- Preview and Production must use separate, explicitly scoped environment variables. Production credentials must never be available to Preview builds.

## Migration work plan

1. Inventory every route, function, scheduled task, environment variable, database dependency, and external API currently used by the new site.
2. Locate or recover the actual source for the AI content bridge and staging API. Their latest Vercel deployments currently fail before build because their configured root directories are absent.
3. Implement the missing backend capabilities inside `maxicar-site`, reusing existing application modules where possible rather than creating another deployable service.
4. Replace cross-project Preview URLs with same-project internal routes.
5. Configure and verify Preview-only credentials without changing Production credentials or the live website.
6. Run build, route, authorization, Supabase, read-only API, pricing, and end-to-end purchase-flow tests in Preview.
7. Only after successful tests, retire the two auxiliary Vercel project deployments/configurations. Do not delete their project records or secrets until source recovery, migration, and dependency checks are complete.

## Safety rules

- Do not attach `maxicar.ir` or any live-site domain to this project during the migration.
- Do not deploy to Production or promote a Preview deployment as part of this work.
- Do not alter the existing production site, its API key, inventory, prices, or order flow.
- Do not copy secret values into Git, documentation, logs, client code, or chat.
- Do not delete `maxicar-ai-core` or `maxicar-staging-api` until their code and dependencies have been recovered and the replacement has passed Preview tests.
- Any operation that writes to upstream Maxicar/Mixin data must remain disabled until its authorization and Preview isolation are verified.

## Current status

- [x] Target project and connected repository identified.
- [x] Three related Vercel projects and their latest deployment states inspected.
- [x] Environment-variable names and targets inventoried without decrypting secrets.
- [x] Initial application routes and Supabase dependencies inspected.
- [ ] Full source inventory completed.
- [x] AI content bridge source recovered and its read-only MCP functionality moved into Next.js.
- [x] Staging API source recovered and its read-only catalog functionality moved into Next.js.
- [x] Catalog reads in `lib/mixin.js` redirected to the same-project server adapter.
- [x] Auxiliary Vercel projects configured to skip future Git builds; project records retained.
- [ ] Transfer/configure `MAXICAR_BRIDGE_TOKEN` and `MAXICAR_SOURCE_API_KEY` in `maxicar-site` Preview.
- [ ] Configure `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `maxicar-site` Preview.
- [ ] Verify the dedicated pricing sandbox variables and keep apply disabled until verified.
- [ ] Preview runtime, authorization, catalog, Supabase, pricing, and end-to-end purchase-flow tests passed.
- [ ] Remove obsolete cross-project environment variables after the dependency scan.
- [ ] Retire the two auxiliary Vercel project records only after all tests pass.
