# Maxicar Management MCP

A preview-only Streamable HTTP MCP server for Maxicar product management.

## Endpoints
- `GET /api/health`: reports readiness flags only; never returns secret values.
- `POST /mcp`: MCP JSON-RPC endpoint, protected by `Authorization: Bearer <MAXICAR_BRIDGE_TOKEN>`.

## Tools
- `list_products`: read/search/paginate products.
- `get_product`: read a product by numeric ID.
- `create_product`: create a product through the upstream Maxicar Open API.
- `update_product`: update a product through the upstream Maxicar Open API.

## Environment
- `MAXICAR_BRIDGE_TOKEN`: independent bearer token for this bridge.
- `MAXICAR_API_KEY`: server-side upstream API key; never return or log it.
- `MAXICAR_PRODUCTS_PATH`: verified relative path beginning with `/api/v4/`, expected to be `/api/v4/products/`.

## Safety
- Use Preview deployments only until end-to-end tests are complete.
- Product create/update tools change the upstream store's data. Do not call them as smoke tests.
- This server does not modify page layout, site content, or source code. Those remain code/repository operations and require access to the correct production source repository.
- Do not promote this deployment to Production without explicit approval.
