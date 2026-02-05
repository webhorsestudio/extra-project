# Property Pages Structure

## Overview
This document defines the structure and routing for property-related pages to prevent duplicates and maintain consistency.

## Property Page Routes

### 1. Main Property Pages (Web)
- **Route**: `/properties/[id]`
- **File**: `src/app/properties/[id]/page.tsx`
- **Purpose**: Main property detail page for web users
- **Navigation**: Used by PropertyCardV2 and search components

### 2. Mobile Property Pages
- **Route**: `/m/properties/[id]`
- **File**: `src/app/m/properties/[id]/page.tsx`
- **Purpose**: Mobile-optimized property detail page
- **Navigation**: Used by mobile PropertyCard component

### 3. Admin Property Pages
- **Route**: `/admin/properties/[id]`
- **File**: `src/app/admin/properties/[id]/page.tsx`
- **Purpose**: Admin property management and editing
- **Navigation**: Used by admin interface

## Component Order (Single Property Page)

The main property page (`/properties/[id]`) follows this component order:

1. **PropertyBreadcrumbs** - Navigation breadcrumbs
2. **PropertyHeroGallery** - Hero image gallery
3. **PropertyInfoCard** - Key property information (price, location, etc.)
4. **ListingBySection** - Developer/agent information
5. **PropertyDescription** - Detailed property description
6. **PropertyFeatures** - Property amenities and features
7. **PropertyLocationMap** - Location visualization
8. **PropertyEnquiryForm** - Contact and enquiry form

## Navigation Consistency

### Property Cards
- **Web**: `PropertyCardV2` → `/properties/${id}`
- **Mobile**: `PropertyCard` → `/m/properties/${id}`

### Search Components
- **SearchBar**: `/properties?filters`
- **SearchInput**: `/properties/${id}` for property results
- **Filter Modals**: `/properties?filters`

## Database Relationships

### Properties Table
- `developer_id` → `property_developers(id)`
- `location_id` → `property_locations(id)`

### Query Structure
```sql
SELECT 
  *,
  property_images(*),
  property_configurations(*),
  developer:property_developers(*),
  property_amenity_relations(
    amenity_id,
    property_amenities(*)
  ),
  property_category_relations(
    category_id,
    property_categories(*)
  )
FROM properties
WHERE id = ? AND status = 'active'
```

## Maintenance Guidelines

### ✅ DO
- Use the established route structure
- Follow the component order defined above
- Use consistent database queries
- Test navigation from property cards
- Update this document when making changes

### ❌ DON'T
- Create duplicate property page files
- Use different route patterns without updating this doc
- Change component order without team discussion
- Use inconsistent database query patterns

## Troubleshooting

### Common Issues
1. **Component not visible**: Check if using correct route and file
2. **Data not loading**: Verify database relationships and query structure
3. **Navigation issues**: Ensure PropertyCard components point to correct routes

### Debug Steps
1. Check browser console for errors
2. Verify the correct page file is being used
3. Confirm database queries are working
4. Test navigation from property cards

## File Locations

```
src/app/
├── properties/
│   ├── [id]/
│   │   └── page.tsx          # Main web property page
│   └── page.tsx              # Properties listing page
├── m/properties/
│   ├── [id]/
│   │   └── page.tsx          # Mobile property page
│   └── page.tsx              # Mobile properties listing
└── admin/properties/
    ├── [id]/
    │   └── page.tsx          # Admin property page
    └── page.tsx              # Admin properties listing
```

## Last Updated
- Date: 2025-01-XX
- Changes: Removed duplicate `/web/properties/[slug]` page
- Reason: Consolidate to single property page structure 