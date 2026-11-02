# Maxicar Site Content Management Plan

## Scope and safety boundary

This plan is for the **preview project only**. The repository `parsazia/maxicar-site` is explicitly a standalone preview and is not confirmed as the source repository for the live `maxicar.ir` site. Do not connect these endpoints to production until the live site's owner, hosting, source repository, and deployment pipeline are verified.

## Required content operations

### Homepage layout
- Read the current published homepage configuration.
- Edit section title, description, visibility, and display options.
- Reorder sections using an explicit ordered list of stable section IDs.
- Preview a draft without publishing it.
- Publish an approved configuration version.
- Roll back to a prior published version.

### Banners
- List banners and retrieve an individual banner.
- Create a draft banner with title, subtitle, image URL/media ID, destination URL, placement, start/end dates, priority, and mobile/desktop variants.
- Edit or archive a banner.
- Preview banner rendering on mobile and desktop.
- Validate image dimensions, safe URL schemes, date range, and required alt text before publish.

### Content pages
- Create, read, edit, preview, publish, unpublish, and archive pages.
- Store title, slug, SEO title/description, canonical path, body blocks, status, and revision metadata.
- Reject duplicate slugs and unsafe HTML; use structured content blocks instead of arbitrary executable markup.
- Preserve redirects when a published slug changes.

### Media
- Upload and list media assets.
- Store alt text, dimensions, file type, file size, and stable media ID.
- Validate MIME type and file size; do not accept arbitrary remote file paths.

### Audit and recovery
- Record actor, timestamp, action, object ID, before/after revision IDs, and outcome.
- Keep drafts separate from published data.
- Require explicit confirmation for publish/unpublish and destructive actions.
- Provide a one-step rollback to the last known-good published revision.

## Proposed API surface

All routes require authenticated, role-checked access and CSRF protection where cookie sessions are used. Public storefront routes must read published data only.

- `GET /api/admin/site-config` — read published configuration and current draft revision.
- `PATCH /api/admin/site-config/draft` — update draft layout settings.
- `PUT /api/admin/site-config/draft/order` — replace the ordered section-ID list.
- `GET|POST /api/admin/banners` — list banners / create draft.
- `GET|PATCH|DELETE /api/admin/banners/:id` — read, edit, or archive a banner.
- `GET|POST /api/admin/pages` — list pages / create draft.
- `GET|PATCH|DELETE /api/admin/pages/:id` — read, edit, or archive a page.
- `POST /api/admin/media` — upload a validated asset.
- `POST /api/admin/publish` — publish a reviewed revision.
- `POST /api/admin/rollback` — restore a prior published revision.
- `GET /api/admin/audit-log` — list recent operations and outcomes.

## Suggested data model

- `SiteConfigRevision`: revision ID, JSON configuration, draft/published status, creator, timestamps.
- `Banner`: ID, content, media references, placement, responsive variants, scheduling, status, revision.
- `ContentPage`: ID, slug, structured body, SEO metadata, status, revision.
- `MediaAsset`: ID, storage key, MIME type, dimensions, byte size, alt text.
- `AuditEvent`: actor, action, entity type/ID, before/after revision IDs, timestamp, result.

## Roles

- Viewer: read published content and previews.
- Editor: create and modify drafts; cannot publish.
- Publisher: publish approved drafts and roll back.
- Administrator: manage users, roles, and integration settings.

## Acceptance tests before any production connection

1. Read-only checks do not create or mutate product or content records.
2. Draft edits are not visible on the public storefront before publishing.
3. Publishing changes only the requested content and creates an audit event.
4. Reordering uses stable IDs and preserves all other section properties.
5. Invalid media, duplicate slugs, malformed dates, and unauthorized requests are rejected.
6. Rollback restores the prior published revision exactly.
7. The test is performed against a preview deployment with test content only.
8. Production domain and live deployment remain unchanged until separately approved.

## Current blockers

- The accessible Vercel account lists only `maxicar-site` and `maxicar-ai-core`; neither project has `maxicar.ir` as a connected domain.
- The `maxicar-site` README identifies it as a standalone preview independent of the live site.
- A read-only request from the preview deployment to `https://maxicar.ir/api/v4/products/` currently fails with `fetch failed` / HTTP 502 at the preview proxy. This must be diagnosed before end-to-end tests.
- The live site's source repository, host, content persistence layer, and supported content-management API are not yet identified. Do not implement production-facing content writes until these are confirmed.
