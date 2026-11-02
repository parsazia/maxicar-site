# Maxicar Staging API

Preview-only, read-only API gateway for Maxicar product data.

- Exposes only GET /api/v4/products/ and GET /api/v4/products/{numeric-id}/.
- Requires a dedicated staging credential via Authorization: Api-Key.
- Uses a server-side source credential to read from the live catalog; that credential is never returned to clients.
- All write methods and all other routes are rejected.
- Production deployments return 404.

Required Preview environment variables:
- MAXICAR_STAGING_API_KEY: dedicated gateway key used by the Maxicar Core preview service.
- MAXICAR_SOURCE_API_KEY: existing Mixen API key, used server-side for read-only requests.

This is an isolated read-only API facade, not a cloned database. It reads current product data from the live catalog and cannot modify it.
