# `/properties/add` Page – Architecture & Codebase Reference

Complete reference for the public "Add Property" page: route, component, data flow, APIs, hooks, database, storage, and RLS.

---

## 1. Route & Access

| URL | File | Layout |
|-----|------|--------|
| `/properties/add` | `src/app/properties/add/page.tsx` | `ServerLayout` (showCategoryBar=false) |

**Page component:** Renders only `<PublicPropertyForm />`. No server-side data fetch; all data loading and submit happen in the client.

**Access:** Form requires **authenticated** user. On load, it calls `supabase.auth.getUser()`; if no user, it redirects to `/users/login`. No role check—any logged-in user can open the form. Entry points:

- **User menu:** "Add Property" → `POST /api/check-seller-status` with user email → if seller → `/properties/add`, else `/seller-registration` (then after registration → `/properties/add`).
- **Seller registration:** After successful registration → redirect to `/properties/add`.
- **Direct:** Visiting `/properties/add` while logged in shows the form.

---

## 2. Main Component: `PublicPropertyForm`

**Path:** `src/components/web/properties/PublicPropertyForm.tsx`  
**Type:** Client component (`'use client'`).

### Steps (wizard)

| Step | Title | Description | Content |
|------|--------|-------------|---------|
| 1 | Basic Info | Property details | Sell/Rent, title (max 25 chars), description, property type (House/Apartment/…), property collection |
| 2 | Location | Property location | Location dropdown, address input, map picker (Leaflet) |
| 3 | Images | Property photos | Multi file upload (images), preview grid |
| 4 | Details | Amenities & categories | Checkboxes for amenities and categories (from APIs) |
| 5 | BHK & Pricing | Configurations | One or more BHK configs: BHK, price, area, bedrooms, bathrooms, ready by, floor plan + brochure file uploads |
| 6 | Review | Final review | Read-only summary of all steps |

### Form state (`FormData`)

- **Basic:** `propertyType` (sell/rent), `title`, `description`, `propertyTypeCategory`, `propertyCollection`
- **Location:** `locationId`, `location` (text), `latitude`, `longitude`
- **Images:** `images: File[]`
- **Details:** `amenities: { name, image_url? }[]`, `categories: { name, icon? }[]`
- **BHK:** `bhkConfigurations`: array of `{ bhk, price, area, bedrooms, bathrooms, readyBy, floorPlan?, brochure?, … }`
- **Meta:** `reraNumber`, `postedBy`, `developerId?`

### Auth and seller prefill

- On mount: `supabase.auth.getUser()`. If no user → `router.push('/users/login')`.
- If user exists: `POST /api/check-seller-status` with `{ email: user.email }`.  
  - If `isSeller` and `seller`: set `postedBy = seller.name`, `developerId = seller.id`.  
  - Else: `postedBy = user.user_metadata?.full_name || user.email || 'Unknown User'`.

---

## 3. Submit Flow (no dedicated API)

Submission uses the **browser Supabase client** only (no REST API for creating the property).

1. **Validate:** User must be logged in; `propertyType` (sell/rent) must be set.
2. **Insert property** (Supabase client):
   - Table: `properties`
   - Payload: `title`, `description`, `property_type` (category string), `property_nature` ('Sell'|'Rent'), `property_collection`, `location_id`, `location`, `latitude`, `longitude`, `rera_number`, `created_by` (user.id), `posted_by`, `developer_id`, `status: 'pending'`
   - Slug: not sent; DB trigger generates it from `title`/`location` on insert.
3. **Images:** For each file in `formData.images`:
   - Upload to storage bucket **`property-images`**, path `{property.id}/{fileName}`.
   - Then insert into **`property_images`**: `property_id`, `image_url` (public URL).  
   (No `display_order` set in this form; DB may default it.)
4. **BHK configurations:** For each `bhkConfigurations` entry:
   - If `floorPlan`/`brochure` file: upload to bucket **`property-files`**, path `{property.id}/{fileName}`.
   - Insert into **`property_configurations`**: `property_id`, `bhk`, `price`, `area`, `bedrooms`, `bathrooms`, `ready_by`, `floor_plan_url`, `brochure_url`.
5. **Amenities:** `createPropertyAmenityRelations(property.id, amenityNames)` (see lib below).
6. **Categories:** `createPropertyCategoryRelations(property.id, categoryNames)` (see lib below).
7. **Success:** Toast "Property submitted successfully! It will be reviewed…", then `router.push('/properties')` and `router.refresh()`.

All of the above (inserts + storage uploads) use the same Supabase **browser client** (`@/lib/supabaseClient`), so RLS applies.

---

## 4. APIs Used (read/helper only)

| API | Method | Purpose |
|-----|--------|---------|
| `/api/check-seller-status` | POST | Body `{ email }`. Returns `isSeller`, `seller: { id, name, … }` if email matches `property_developers.contact_info->>email`. Used to set `postedBy` and `developerId`. |
| `/api/locations` | GET | List locations (admin param optional). Used by `useLocations()` for step 2 dropdown. |
| `/api/amenities` | GET | List amenities. Used by `useAmenities()` for step 4. |
| `/api/categories` | GET | List categories. Used by `useCategories()` for step 4. |

There is **no** `POST /api/properties` or similar for creating a property; creation is done client-side with Supabase.

---

## 5. Hooks

| Hook | Path | Purpose |
|------|------|---------|
| `useLocations()` | `src/hooks/useLocations.ts` | Fetches `/api/locations`, returns `{ locations, loading, error }` (active only). |
| `useAmenities()` | `src/hooks/useAmenities.ts` | Fetches `/api/amenities`, returns `{ amenities, loading, error, … }`. |
| `useCategories()` | `src/hooks/useCategories.ts` | Fetches `/api/categories`, returns `{ categories, loading, error, refetch, … }`. |

---

## 6. Lib / Helpers

| Module | Path | Purpose |
|--------|------|---------|
| `createPropertyAmenityRelations(propertyId, amenityNames)` | `src/lib/property-relationships.ts` | Resolves amenity IDs from `property_amenities` by name, then inserts into `property_amenity_relations` (Supabase client). |
| `createPropertyCategoryRelations(propertyId, categoryNames)` | Same file | Resolves category IDs from `property_categories` by name, then inserts into `property_category_relations` (Supabase client). |
| `supabase` (browser client) | `src/lib/supabaseClient.ts` | `createBrowserClient(SUPABASE_URL, ANON_KEY)` for all client-side DB and storage. |

---

## 7. Map & Geocoding

- **Map:** `PublicPropertyMapPicker` (`src/components/web/properties/PublicPropertyMapPicker.tsx`), loaded with `dynamic(…, { ssr: false })`. Uses Leaflet; default center India `[20.5937, 78.9629]`; supports position prop and `onPositionChange`.
- **Geocoding:** Form uses **Nominatim (OpenStreetMap)**:
  - Address → coords: `https://nominatim.openstreetmap.org/search?format=json&q=…`
  - Coords → address: `https://nominatim.openstreetmap.org/reverse?format=json&lat=…&lon=…`
- **Location dropdown:** Values from `useLocations()`; on select, form sets `locationId` and `location` (name) and triggers geocode to update map.

---

## 8. Database Schema (relevant parts)

- **properties:** id, title, description, property_type, property_nature, property_collection, location_id (FK → property_locations), location (text), latitude, longitude, rera_number, created_by, posted_by (TEXT – name or developer name), developer_id (FK → property_developers), status, slug (auto by trigger), video_url, parking, etc.
- **property_images:** id, property_id, image_url, display_order (optional).
- **property_configurations:** id, property_id, bhk, price, area, bedrooms, bathrooms, ready_by, floor_plan_url, brochure_url.
- **property_amenity_relations:** property_id, amenity_id (from property_amenities by name).
- **property_category_relations:** property_id, category_id (from property_categories by name).
- **property_locations / property_amenities / property_categories:** Lookup tables; form uses names to resolve IDs in relationship lib.

Slug is generated by trigger `update_property_slug` on INSERT/UPDATE when slug is null/empty (function `generate_property_slug(title, location)`).

---

## 9. Storage Buckets

| Bucket | Use on add page | Policies (from migrations) |
|--------|------------------|----------------------------|
| **property-images** | Property photos; path `{propertyId}/{fileName}` | No policy found in migrations; bucket may be created in dashboard. If RLS is default-deny, authenticated upload may need a policy. |
| **property-files** | Floor plans and brochures; path `{propertyId}/{fileName}` | `20250217000018`: INSERT/SELECT/UPDATE/DELETE for `authenticated` on `bucket_id = 'property-files'`. |

---

## 10. RLS (critical for add flow)

- **properties:**  
  - Migration `20250701000011` adds "Allow authenticated users to manage properties" FOR ALL (authenticated).  
  - Later cleanups add "Admin full access" and "Users can manage own properties" (auth.uid() = posted_by; note posted_by is TEXT in schema, so this may not match).  
  - If "Allow authenticated users to manage properties" is still present, **authenticated users can INSERT** properties.

- **property_configurations:**  
  - After final cleanup (`20250701000058`): only **Admin full access** and **Public read**.  
  - **Authenticated INSERT is dropped**; non-admin users **cannot** insert rows. So the add form’s step 5 (BHK/configs) will **fail** for normal users unless an “authenticated insert” policy is re-added.

- **property_images:**  
  - After same cleanup: only **Admin full access** and **Public read**.  
  - **No authenticated INSERT**; non-admin users **cannot** insert rows. So the add form’s image step will **fail** for normal users unless an “authenticated insert” policy is added.

- **property_amenity_relations / property_category_relations:**  
  - Public read + “Authenticated users can insert” (from fix_relationship_tables). So step 4 (amenities/categories) can work for authenticated users.

**Fix applied:** Migration `20250710000065_allow_authenticated_insert_property_images_configs.sql` adds authenticated INSERT for these tables. **Recommendation (if not using that migration):** Add RLS policies so that **authenticated** users can **INSERT** into `property_configurations` and `property_images` (e.g. WITH CHECK that the referenced property exists and optionally that they have a right to it, or simple “authenticated can insert” if acceptable). Ensure the **property-images** bucket allows authenticated upload if the form is to work end-to-end.

---

## 11. Migrations (concise list)

- Properties: slug, location_id, status, collection, posted_by, developer_id, video_url, parking, property_nature, etc.
- property_locations, property_configurations, property_images, property_amenities, property_categories, property_amenity_relations, property_category_relations, property_developers.
- RLS: multiple cleanup migrations; final state leaves property_configurations and property_images without authenticated insert (see above).
- Storage: property-files policies in `20250217000018`; property-images not defined in scanned migrations.

---

## 12. Types

- Form state is local (`FormData` interface in the component).
- Property/amenity/category types: `@/types/property`, `@/types/amenity`; categories from hook/API.

---

## 13. Navigation & UX

- **Stepper:** Sidebar (desktop) and top bar (mobile); steps 1–6; Next/Previous; last step = "Submit for Review".
- **Success:** Redirect to `/properties` and refresh.
- **Errors:** Toasts via `@/components/ui/use-toast`; Supabase/upload errors shown in toast.

---

## 14. Summary

- **Route:** `src/app/properties/add/page.tsx` → `ServerLayout` + `PublicPropertyForm`.
- **Form:** 6-step wizard; auth required; seller check prefills `postedBy`/`developerId`; submit = direct Supabase inserts + storage uploads (no create-property API).
- **APIs:** Only for check-seller-status and for locations/amenities/categories lists.
- **Hooks:** useLocations, useAmenities, useCategories.
- **Lib:** property-relationships (amenity/category relations); supabaseClient (browser).
- **RLS:** Authenticated insert for **properties** is allowed by "Allow authenticated users to manage properties". Migration `20250710000065` adds authenticated INSERT for **property_images** and **property_configurations** so the add flow works for regular users. Ensure **property-images** bucket allows authenticated upload.
