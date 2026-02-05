# Property Page Architecture: `/properties/[slug]`

Complete reference for the single property page (e.g. `/properties/5-bhk-ultra-luxury-residences-at-lodha-bellevue-tower-3`), including routes, database schema, APIs, hooks, migrations, and components.

---

## 1. Route & URL

| URL pattern | Page file | Purpose |
|-------------|-----------|---------|
| `/properties/[slug]` | `src/app/properties/[slug]/page.tsx` | Desktop single property page (slug-based) |
| `/m/properties/[id]` | `src/app/m/properties/[id]/page.tsx` | Mobile single property page (uses `id` in path; can receive slug and resolve) |

- **Slug**: SEO-friendly, unique, generated from `title` (e.g. `5-bhk-ultra-luxury-residences-at-lodha-bellevue-tower-3`).
- **Middleware** (`src/middleware.ts`): Redirects by device — mobile → `/m/properties/{slug}`, desktop on `/m/` → `/properties/{slug}`. UUID in path → redirect to listing.
- **Slug extraction**: `src/lib/device-detection.ts` → `extractSlugFromPropertyUrl(pathname)`.

---

## 2. Page Component (Server)

**File:** `src/app/properties/[slug]/page.tsx`

- **Params:** `params.slug` (from dynamic segment).
- **Data:** Fetched **server-side** with Supabase (no dedicated REST “get by slug” route).
- **Metadata:** `generateMetadata()` fetches property by slug, then calls `generatePropertyMetadata()` and `generatePropertyStructuredData()` from `@/lib/seo`.

### Main query (Supabase)

```ts
.from('properties')
.select(`
  *,
  property_images(*),
  property_configurations(*),
  location_data:property_locations!location_id(*),
  developer:property_developers!developer_id(*),
  property_amenity_relations(amenity_id, property_amenities(*)),
  property_category_relations(category_id, property_categories(*))
`)
.eq('slug', slug)
.eq('status', 'active')
.single()
```

- **404:** If error or no row → `notFound()`.
- **Related content:** `getRelatedProperties()` from `@/lib/seo/internal-linking.ts` (same location/type/price/BHK scoring).
- **Layout:** Wrapped in `ServerLayout` (footer, branding, locations, config, categories, user).

---

## 3. Database Schema (Properties & Related)

The **base `properties` table** is assumed to exist (created outside the listed migrations). Migrations only **alter** it or add related tables.

### Core tables

| Table | Purpose |
|------|---------|
| `properties` | Main listing (title, description, location, status, slug, location_id, developer_id, video_url, etc.) |
| `property_configurations` | BHK/configs: price, bedrooms, bathrooms, area, floor_plan_url, brochure_url, ready_by |
| `property_images` | Images per property; `display_order` for ordering |
| `property_locations` | Location master (name, image_url, description); `properties.location_id` → FK |
| `property_developers` | Developer/broker (name, logo_url, contact_info); `properties.developer_id` → FK |
| `property_categories` | Category master (name, icon); many-to-many via `property_category_relations` |
| `property_amenities` | Amenity master (name, image_url); many-to-many via `property_amenity_relations` |
| `property_category_relations` | (property_id, category_id) |
| `property_amenity_relations` | (property_id, amenity_id) |
| `property_views` | View tracking: property_id, viewer_ip, user_agent, viewed_at |
| `property_favorites` | User favorites: property_id, user_id |

### Properties table (columns from migrations)

- `slug` (TEXT UNIQUE, NOT NULL) — from `20250104000001_add_property_slugs.sql`
- `location_id` (UUID → property_locations) — `20250217000029_add_location_id_to_properties.sql`
- `developer_id` (UUID → property_developers) — `20250217000075_create_property_developers_table.sql`
- `status` (e.g. active, pending, sold), `is_verified`, `verified_at`, `verified_by` — `20250217000030_add_property_status_fields.sql`
- `property_collection` (enum: Newly Launched, Featured, Ready to Move, Under Construction) — `20250217000016_add_property_collection.sql`, `20250217000033_update_property_collection_enum.sql`
- `posted_by` (TEXT) — `20250217000020_add_posted_by_column.sql` (later migrations may use UUID for auth)
- `video_url` (TEXT) — `20250217000079_add_video_url_to_properties.sql`
- `property_nature` (Sell/Rent) — `20250710000003_add_property_nature_column.sql`
- Parking fields — `20250701000006_add_parking_fields_to_properties.sql`
- Slug trigger: `update_property_slug()` on INSERT/UPDATE when slug is null/empty — `20250104000001_add_property_slugs.sql`

### RLS (summary)

- **properties:** Public SELECT for active (or status-based); admin full access; users manage own (e.g. by `posted_by`).
- **property_configurations, property_images:** Public read; admin full.
- **property_amenity_relations, property_category_relations:** Public read; authenticated insert/delete.
- **property_views:** Public read; anyone can insert (for view tracking).
- **property_favorites:** Per-user (user_id) access.

---

## 4. API Routes (Relevant to Property Page)

| Route | Methods | Purpose |
|-------|---------|---------|
| `GET /api/properties` | GET | List/filter properties (search, location, type, BHK, price); used by listing, not by single page |
| `GET /api/properties/enhanced` | GET | Enhanced list (optional slug filter, fuzzy search) |
| `GET/POST/DELETE /api/properties/[id]/favorites` | GET, POST, DELETE | Check/add/remove favorite (auth required) |
| `GET/POST /api/properties/[id]/views` | GET, POST | Get view count; record view (property_id, viewer_ip, user_agent, viewed_at) |
| `GET /api/properties/[id]/similar` | GET | Similar properties |
| `GET /api/properties/[id]/amenities` | GET | Amenities for property |
| `GET /api/properties/[id]/categories` | GET | Categories for property |
| `GET /api/properties/[id]/configurations` | GET | Configurations for property |
| `POST /api/inquiries` | POST | Submit inquiry (contact/tour); body can include property_id, property_name, tour_date, etc. |

- **Single property by slug:** No REST route; the page uses Supabase client directly with `.eq('slug', slug)`.
- **Views API:** Uses `viewer_ip` (matches DB). Previously used `ip_address`; corrected to `viewer_ip` to match `property_views` schema.

---

## 5. Hooks & Server Helpers

| Location | Name | Purpose |
|----------|------|---------|
| `src/lib/seo/internal-linking.ts` | `getRelatedProperties(currentProperty, limit)` | Related properties by location, type, BHK, price; returns `RelatedContent[]` with slug/url |
| `src/lib/seo/metadata.ts` | `generatePropertyMetadata(property, config)` | Next.js metadata (title, description, canonical, OG) for property |
| `src/lib/seo/structured-data.ts` | `generatePropertyStructuredData(property, config)` | JSON-LD for property page |
| `src/lib/seo/config.ts` | `getSEOConfig()` | Site URL, site name, defaults |
| `src/lib/supabase/api.ts` | `createSupabaseApiClient()` | Server Supabase client (cookies) used in page and API routes |
| `src/lib/device-detection.ts` | `extractSlugFromPropertyUrl`, `detectDeviceFromUserAgent` | Slug from path; device type for redirects |

No React hooks are required for the initial property data; the page is server-rendered. Client components (e.g. enquiry form, favorites) may use fetch or SWR for APIs.

---

## 6. Migrations (Chronological, Property-Related)

- `20250104000001_add_property_slugs.sql` — slug column, unique index, `generate_property_slug()`, trigger.
- `20250104000002_fix_property_slugs.sql` — slug fixes/regeneration.
- `20250217000016_add_property_collection.sql` — property_collection enum/column.
- `20250217000017_add_bhk_fields.sql` — property_configurations (floor_plan_url, brochure_url, ready_by).
- `20250217000020_add_posted_by_column.sql` — posted_by on properties.
- `20250217000022_add_public_read_policies.sql` — public read on properties, blogs, blog_categories.
- `20250217000025_create_property_locations_table.sql` — property_locations.
- `20250217000026_fix_property_locations_rls.sql` — RLS for property_locations.
- `20250217000028_create_property_categories_table.sql` — property_categories.
- `20250217000029_add_location_id_to_properties.sql` — properties.location_id → property_locations.
- `20250217000030_add_property_status_fields.sql` — status, is_verified, verified_at, verified_by.
- `20250217000031_create_property_views_table.sql` — property_views (viewer_ip, user_agent, viewed_at).
- `20250217000032_create_property_favorites_table.sql` — property_favorites.
- `20250217000033_update_property_collection_enum.sql` — collection enum update.
- `20250217000034_add_properties_update_policy.sql` — update/insert/delete policies.
- `20250217000035_add_property_configurations_rls.sql` — RLS for property_configurations.
- `20250217000051_add_admin_rls_policies.sql` — admin policies.
- `20250217000062_fix_relationship_tables_public_access.sql` — public read for amenity/category relations.
- `20250217000075_create_property_developers_table.sql` — property_developers + properties.developer_id.
- `20250217000076_fix_property_developers_rls.sql` — RLS for property_developers.
- `20250217000078_update_properties_for_developer_selection.sql` — developer selection.
- `20250217000079_add_video_url_to_properties.sql` — video_url.
- `20250217000080_add_public_read_policy_to_property_developers.sql` — public read property_developers.
- `20250217000081_add_display_order_to_property_images.sql` — display_order on property_images.
- `20250701000000_create_property_amenities_table.sql` — property_amenities.
- `20250701000004_create_property_amenity_relations_table.sql` — property_amenity_relations.
- `20250701000005_create_property_category_relations_table.sql` — property_category_relations.
- `20250701000006_add_parking_fields_to_properties.sql` — parking on properties.
- `20250701000007_fix_property_categories_rls.sql` — RLS for property_categories.
- `20250701000056_final_admin_rls_cleanup.sql` / `...57` / `...58` — RLS cleanup (properties, property_configurations, property_images, etc.).
- `20250710000003_add_property_nature_column.sql` — property_nature (Sell/Rent).

---

## 7. UI Components (Property Page)

| Component | Path | Role |
|----------|------|------|
| ServerLayout | `src/components/web/ServerLayout.tsx` | Wraps page; footer, branding, nav, categories, user |
| PropertyBreadcrumbs | `src/components/web/property/PropertyBreadcrumbs.tsx` | Breadcrumb nav |
| PropertyHeroGallery | `src/components/web/property/PropertyHeroGallery.tsx` | Image gallery + section tabs (Key Highlights, Configurations, Features, Similar) |
| PropertyInfoCard | `src/components/web/property/PropertyInfoCard.tsx` | Title, price, location, BHK, area, share/favorite |
| PropertyDescription | `src/components/web/property/PropertyDescription.tsx` | Description, RERA; id="key-highlights" |
| ListingBySection | `src/components/web/property/ListingBySection.tsx` | Developer/agent info |
| PropertyConfigurations | `src/components/web/PropertyConfigurations.tsx` | BHK/configs, floor plans, brochures; id="configurations" |
| PropertyLocationMap | `src/components/web/property/PropertyLocationMap.tsx` | Map (lat/lng or geocode location) |
| PropertyVideo | `src/components/web/property/PropertyVideo.tsx` | video_url embed |
| PropertyFeatures | `src/components/web/property/PropertyFeatures.tsx` | Amenities & categories (icons/images); id="features" |
| PropertyEnquiryForm | `src/components/web/property/PropertyEnquiryForm.tsx` | Contact + Tour tabs; POST `/api/inquiries` |
| SimilarPropertiesCarousel | `src/components/web/similar-properties/SimilarPropertiesCarousel.tsx` | Similar properties; id="similar-projects" |

---

## 8. Types

**File:** `src/types/property.ts`

- `Property` — id, slug, title, description, property_type, property_nature, property_collection, location_id, location, latitude, longitude, property_images, property_configurations, location_data, developer, property_amenity_relations → amenities, property_category_relations → categories, status, etc.
- `BHKConfiguration`, `PropertyImage`, `PropertyAmenityRelation`, `PropertyCategoryRelation`, `PropertyView`, `PropertyFavorite`, `PropertyCategory`, `PropertyDeveloper`, etc.

---

## 9. Data Flow Summary

1. User requests `/properties/5-bhk-ultra-luxury-residences-at-lodha-bellevue-tower-3`.
2. Middleware may redirect mobile → `/m/properties/{slug}` (or desktop on `/m/` → `/properties/{slug}`).
3. Page loads; `params.slug` = `5-bhk-ultra-luxury-residences-at-lodha-bellevue-tower-3`.
4. `generateMetadata` and page component use Supabase (createSupabaseApiClient) to fetch property by `slug` and `status = 'active'`, with all joins.
5. Metadata and JSON-LD are generated; page renders with ServerLayout and all property sections.
6. `getRelatedProperties()` runs server-side for similar properties.
7. Client: enquiry form POSTs to `/api/inquiries`; favorites/views use `/api/properties/[id]/favorites` and `/api/properties/[id]/views` (id = property.id from server data).

---

## 10. Bug Fix Applied

- **property_views:** API was using column `ip_address`; schema has `viewer_ip`. Updated `src/app/api/properties/[id]/views/route.ts` to use `viewer_ip` in both the duplicate-check filter and the insert payload.

---

## 11. Doc vs Implementation Note

- `docs/single-property-page.md` still describes the page as `[id]` and “fetch by id”. The live implementation uses **`[slug]`** and **fetch by slug** in `src/app/properties/[slug]/page.tsx`. This file is the authoritative reference for the current slug-based architecture.
