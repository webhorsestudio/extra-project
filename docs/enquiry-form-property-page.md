# "Enquiry About" Form on Individual Property Page – Details

Complete reference for the enquiry form in the sidebar of the single property page (`/properties/[slug]`).

---

## 1. Where It Lives

| Item | Location |
|------|----------|
| **Component** | `src/components/web/property/PropertyEnquiryForm.tsx` |
| **Usage** | `src/app/properties/[slug]/page.tsx` — rendered in the right sidebar inside `<PropertyEnquiryForm property={property} />` |
| **API** | `POST /api/inquiries` (and `GET /api/inquiries` for health/count only) |

The form is a **client component** (`'use client'`). It receives the full **property** object from the server-rendered page (id, title, location, location_data, property_configurations, etc.).

---

## 2. Form Tabs and Headings

- **Tab 1 – "Contact Now"**  
  - Heading: **"Enquiry About {property.title}"**  
  - Generic contact enquiry: name, email, phone, configuration checkboxes, message.

- **Tab 2 – "Request a tour"**  
  - Heading: **"Schedule a Property Tour"**  
  - Tour booking: name, email, phone, date picker, time slot, tour type (Site Visit / Video Chat).

So the **"Enquiry About"** wording is the **Contact Now** tab heading: `Enquiry About {property.title}`.

---

## 3. Contact Now Tab

### Fields

| Field | Type | Required (UI) | Required (API) | Notes |
|-------|------|----------------|----------------|--------|
| Your Name | text | ✓ (HTML `required`) | ✓ | |
| E-mail address | email | ✓ (required) | ✓ | |
| Phone Number | tel | ✓ (HTML `required`) | No | Stored as null if empty. |
| Configuration | checkboxes | No | No | Built from `property.property_configurations` (e.g. 1BHK, 2BHK). Multiple selection. |
| Message | textarea | ✓ (required) | ✓ | |

### Submit payload (JSON)

```json
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "message": "...",
  "inquiry_type": "contact",
  "property_id": "<property.id>",
  "property_name": "<property.title>",
  "property_location": "<property.location>",
  "property_configurations": "{ \"2BHK\", \"3BHK\" }"
}
```

- **property_configurations:** Built as a **Postgres array literal string** from selected BHK labels (e.g. `{"2BHK", "3BHK"}`). Sent as a **string** in JSON; DB column is `TEXT[]` — storage/parsing may need verification.

### Validation (client)

- Only HTML5 `required` on name and phone.
- No client-side check for email or message, but API requires both.

### After success

- Success message: "Enquiry submitted successfully!"
- Form reset: name, email, phone, config checkboxes, message cleared.

---

## 4. Request a Tour Tab

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| Your Name | text | ✓ | |
| Email Address | email | ✓ | |
| Phone Number | tel | No | Placeholder: "Phone Number (optional)" |
| Select Date | date picker | ✓ | 14-day strip; starts tomorrow; prev/next week navigation. |
| Select Time | select | ✓ | Slots 9:00 AM–7:00 PM (hourly). |
| Tour Type | checkboxes | At least one | "Site Visit", "Video Chat". |

### Validation (client)

- Name, email, date, time required.
- At least one of Site Visit / Video Chat required.
- Errors shown in a red box above the form.

### Submit payload (JSON)

```json
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "message": "Tour request",
  "inquiry_type": "tour",
  "property_id": "<property.id>",
  "property_name": "<property.title>",
  "property_location": "<property.location>",
  "tour_date": "YYYY-MM-DD",
  "tour_time": "e.g. 10:00 AM",
  "tour_type": "{ \"siteVisit\", \"videoChat\" }"
}
```

- **tour_type:** Built as Postgres array literal string (e.g. `{"siteVisit", "videoChat"}`). Sent as string; DB column is `TEXT[]`.

### inquiry_type and DB constraint

- Form sends **`inquiry_type: "tour_booking"`** so rows are accepted and appear in admin Tour Bookings.
- DB constraint (after migration `20250710000063_add_tour_booking_inquiry_type.sql`) allows: `'property' | 'contact' | 'support' | 'tour_booking' | 'other'`.

### After success

- Message: "Tour request submitted successfully!"
- Form reset: all tour fields cleared.

---

## 5. API: POST /api/inquiries

**File:** `src/app/api/inquiries/route.ts`

### Request handling

- **Content-Type: application/json** (property page form): body parsed as JSON.
- **multipart/form-data**: supported for other use (e.g. attachment); fields read from `FormData`.

### Validation (server)

- **Required for all submissions:** `name`, `email`, `message`.
- Contact tab: form allows empty message; API will return 400 if `message` is missing or blank.
- Tour tab: form sends fixed `message: "Tour request"`, so validation passes.

### Optional fields passed through to DB

- subject, priority, category, attachment (file → upload to storage bucket `inquiries`, then `attachment_url` saved)
- property_id, property_name, property_location, property_configurations, property_price_range
- tour_date, tour_time, tour_type, tour_status

### Insert

- Table: **`inquiries`**.
- Defaults: `priority = 'normal'`, `category = 'general'`, `inquiry_type` from body, `status = 'unread'`.
- If attachment present: upload to Supabase storage `inquiries/{inquiry_type}/{filename}`, store public URL in `attachment_url`.

### Response

- **200:** `{ success: true, message: '...', inquiry: {...}, id: inquiry.id }`
- **400:** validation error (e.g. missing name/email/message)
- **500:** table check, insert, or upload error

---

## 6. Database: `inquiries` Table

Relevant columns (from migrations):

| Column | Type | Notes |
|--------|------|--------|
| id | UUID | PK, default gen_random_uuid() |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| phone | TEXT | nullable |
| message | TEXT | NOT NULL |
| inquiry_type | TEXT | NOT NULL, check constraint (see below) |
| status | TEXT | default 'unread', check (unread, read, resolved, etc.) |
| property_id | UUID | FK → properties(id), ON DELETE SET NULL |
| created_at, updated_at | TIMESTAMPTZ | |
| subject | TEXT | nullable |
| priority | TEXT | default 'normal' |
| source | TEXT | default 'website' |
| attachment_url | (added elsewhere) | from file upload |
| property_name | TEXT | |
| property_location | TEXT | |
| property_configurations | TEXT[] | array |
| property_price_range | TEXT | |
| tour_date | DATE | |
| tour_time | TEXT | |
| tour_type | TEXT[] | array |
| tour_status | TEXT | default 'pending' |
| assigned_to, response_notes, responded_at, response_method | various | from contact/support enhancement |

**inquiry_type check (current state):**  
`IN ('property', 'contact', 'support', 'tour_booking', 'other')` (after migration `20250710000063_add_tour_booking_inquiry_type.sql`).

---

## 7. Migrations (inquiries)

- **20250217000009** – create `inquiries` (basic columns, inquiry_type: property, contact, other).
- **20250217000010** – fix `update_inquiries_updated_at` trigger.
- **20250217000079** – add property/tour columns, add `tour_booking` to inquiry_type, create `set_inquiry_type` trigger, views `property_inquiries_view`, `tour_bookings_view`.
- **20250701000062** – add subject, priority, source, assigned_to, response_notes, etc.; **redefine inquiry_type check to (property, contact, support, other)** — removes `tour_booking`.
- **20250703000080** – update `property_inquiries_view` to join `property_locations` and show location name.

---

## 8. Admin Side

- **Property inquiries (Contact Now):**  
  `src/app/admin/inquiries/property/page.tsx` → reads from **`property_inquiries_view`** (inquiry_type = 'property' or has property_configurations).
- **Tour bookings (Request a tour):**  
  `src/app/admin/inquiries/tour/page.tsx` → reads from **`tour_bookings_view`** (inquiry_type = 'tour_booking' or has tour_date/tour_time).

If the form sends `inquiry_type: 'tour'` and the constraint blocks it, no row is inserted and the tour will never appear in admin. Fixing the constraint (and optionally normalizing to `tour_booking`) resolves this.

---

## 9. Types and Styling

- **Property type:** `Property` from `@/types/property`.
- **Styling:** Tailwind; primary color `#0A1736`; rounded corners, shadow, sticky header; two-tab layout; scrollable content area.

---

## 10. Fixes Applied

1. **Tour inquiry_type:** Form now sends `'tour_booking'`; migration `20250710000063_add_tour_booking_inquiry_type.sql` adds `tour_booking` to the `inquiry_type` check so tour submissions succeed and appear in admin Tour Bookings.
2. **Contact – email and message:** Email input and message textarea are now `required` so the form matches API validation.

## 11. Optional Follow-ups

- **property_configurations / tour_type:** Sent as Postgres array literal strings. If inserts fail with type errors, send arrays as JSON (e.g. `["3BHK","4BHK"]`) and ensure the API/DB layer maps them to `TEXT[]`.

---

## 12. Quick Reference: Form → API → DB

- **Contact:** `inquiry_type: 'contact'`, plus property_id, property_name, property_location, property_configurations (string), name, email, phone, message.
- **Tour:** `inquiry_type: 'tour_booking'`, plus property_id, property_name, property_location, tour_date, tour_time, tour_type (string), fixed message "Tour request".
- **Endpoint:** `POST /api/inquiries`, JSON body.
- **Table:** `inquiries`; admin uses `property_inquiries_view` and `tour_bookings_view`.
