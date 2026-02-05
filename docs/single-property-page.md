# Single Property Page Documentation

## Overview

The Single Property Page displays detailed information about a specific property, including images, pricing, configurations, features, location, developer info, enquiry form, and similar properties. It is designed for clarity, performance, and a modern user experience, with dynamic data loading and smooth navigation.

---

## File Structure

- **Page Component:**  
  `src/app/properties/[id]/page.tsx`
- **Key Components:**
  - `PropertyHeroGallery` (image gallery & tab navigation)
  - `PropertyInfoCard` (price, title, summary)
  - `PropertyDescription` (description/highlights)
  - `ListingBySection` (developer/agent info)
  - `PropertyConfigurations` (BHK/configurations)
  - `PropertyLocationMap` (map, geocoding support)
  - `PropertyFeatures` (amenities & categories, dynamic icons/images)
  - `PropertyEnquiryForm` (sidebar enquiry form)
  - `SimilarPropertiesCarousel` (similar properties)

---

## Data Flow & Fetching

- **Data Source:**
  - Uses Supabase client to fetch property data by `id`.
  - Fetches related data: images, configurations, amenities, categories, developer, location, etc.
- **Data Mapping:**
  - Maps amenity and category relations to flat arrays for easy component consumption.
  - Amenities: `{ name, image_url }[]`
  - Categories: `{ name, icon }[]` (icon is a Lucide icon name string)
- **Similar Properties:**
  - Uses a service to fetch and display similar properties based on current property attributes.

---

## Main Components & Sections

### 1. PropertyHeroGallery
- Displays property images in a gallery with modal view.
- Includes tab navigation for quick section jumps (Key Highlights, Configurations, Features, Similar Projects).

### 2. PropertyInfoCard
- Shows price, title, location, BHK, area, and EMI info.
- Includes share and favorite buttons.

### 3. PropertyDescription
- Shows the main property description and RERA number.
- Section is marked with `id="key-highlights"` for tab navigation.

### 4. ListingBySection
- Displays developer or agent information, logo, and contact details.

### 5. PropertyConfigurations
- Shows available BHK/configurations with tabs and selectors.
- Displays floor plans and brochures if available.
- Section is marked with `id="configurations"`.

### 6. PropertyLocationMap
- Shows a map using latitude/longitude or geocodes the location name if coordinates are missing.
- Section is not directly navigable by tab, but is always present if data is available.

### 7. PropertyFeatures
- Shows amenities and categories in tabbed view.
- Amenities: Uses real images if available, otherwise falls back to defaults.
- Categories: Dynamically renders Lucide icons by name from the DB (fully dynamic, no hardcoded mapping needed).
- Section is marked with `id="features"`.

### 8. PropertyEnquiryForm
- Sticky sidebar form for user enquiries and tour requests.
- Responsive and styled as a card.

### 9. SimilarPropertiesCarousel
- Shows similar properties in a full-width, boxed section at the bottom.
- Section is marked with `id="similar-projects"`.

---

## Navigation & Section Anchors

- Tab navigation in the gallery uses `scrollIntoView` to jump to the correct section by `id`.
- Section IDs:
  - `key-highlights` (Description)
  - `configurations` (Configurations)
  - `features` (Features)
  - `similar-projects` (Similar Properties)

---

## Dynamic Features

- **Dynamic Icon Rendering:**
  - Category icons are rendered dynamically using the Lucide icon name from the DB.
  - No code changes are needed to add new icons—just use a valid Lucide icon name in the DB.
- **Map Geocoding:**
  - If latitude/longitude are missing, the map will geocode the location name and display the map accordingly.
- **Section Navigation:**
  - Tab navigation is smooth and works on all screen sizes.

---

## Extensibility & Best Practices

- **Adding New Sections:**
  - Add a new section in the main page and update the tab navigation arrays in `PropertyHeroGallery`.
- **Adding New Icons:**
  - Use any valid Lucide icon name in the DB for categories.
- **Type Safety:**
  - For further type safety, define interfaces for relation objects and avoid using `any`.
- **Performance:**
  - Data is fetched server-side for fast initial load and SEO.
- **Responsiveness:**
  - All components are responsive and mobile-friendly.

---

## Example: Adding a New Category Icon

1. In the admin panel, set the `icon` field for a category to a valid Lucide icon name (e.g., `"Gift"`).
2. The icon will appear automatically in the Features section—no code changes required.

---

## Troubleshooting

- **Tab navigation not working?**
  - Ensure section IDs match the tabSectionIds array in `PropertyHeroGallery`.
- **Category icon not showing?**
  - Make sure the icon name in the DB matches a Lucide icon exactly (case-sensitive).
- **Map not showing?**
  - Ensure either latitude/longitude or a valid location name is present in the property data.

---

## Credits
- Built with Next.js, Supabase, Lucide React, and Tailwind CSS.
- Designed for extensibility, maintainability, and a modern real estate experience.

---

## API & Routes

### Data Fetching

The single property page fetches all property data server-side using Supabase. There is no separate REST API route; instead, the page uses the Supabase client directly to query the database with all necessary joins for related data.

#### Main Query Example (in `src/app/properties/[id]/page.tsx`):

```ts
const { data: property, error } = await supabase
  .from('properties')
  .select(`
    *,
    property_images(*),
    property_configurations(*),
    location_data:property_locations!location_id(*),
    developer:property_developers!developer_id(*),
    property_amenity_relations(
      amenity_id,
      property_amenities(*)
    ),
    property_category_relations(
      category_id,
      property_categories(*)
    )
  `)
  .eq('id', id)
  .eq('status', 'active')
  .single();
```

- This query fetches the property by `id` and joins all related tables:
  - `property_images`: All images for the property
  - `property_configurations`: All BHK/configurations
  - `property_locations`: Location data (for geocoding/map)
  - `property_developers`: Developer/agent info
  - `property_amenity_relations` & `property_amenities`: Amenities (with images)
  - `property_category_relations` & `property_categories`: Categories (with icon names)

#### Data Mapping

After fetching, the page maps the relations to flat arrays for easy use in components:

```ts
if (property) {
  property.amenities = property.property_amenity_relations?.map((rel: any) => ({
    name: rel.property_amenities?.name,
    image_url: rel.property_amenities?.image_url
  })).filter((a: any) => a.name) || [];
  property.categories = property.property_category_relations?.map((rel: any) => ({
    name: rel.property_categories?.name,
    icon: rel.property_categories?.icon
  })).filter((c: any) => c.name) || [];
}
```

### Similar Properties Service

- The page uses a service (`SimilarPropertiesService`) to fetch similar properties based on the current property's attributes.
- This service may use additional queries and logic to find and rank similar listings.

### API Endpoints

- There are no custom REST API endpoints for the single property page; all data is fetched directly from Supabase using the client SDK.
- If you want to expose a public API, you can create a route in `src/app/api/properties/[id]/route.ts` and use similar logic as above.

### Security & Policies

- Supabase Row Level Security (RLS) is enabled for all tables.
- Public read access is allowed for property data, but write access is restricted to admins.

--- 