# 🎯 Popup Ads Management System

A comprehensive popup advertisement management system for web and mobile layouts, built with Next.js 15+ and Supabase.

## ✨ Features

### **Popup Ad Types**
- **Banner**: Top/bottom banner ads
- **Modal**: Center overlay popups
- **Toast**: Small notification popups
- **Slide In**: Side-sliding advertisements
- **Fullscreen**: Full-screen overlay ads

### **Positioning Options**
- Top Left, Top Right, Top Center
- Bottom Left, Bottom Right, Bottom Center
- Center (default)

### **Advanced Targeting**
- **Platform Support**: Mobile, Desktop, Tablet
- **Page Targeting**: Show on specific pages or exclude from others
- **Scheduling**: Start/end dates, display delays, duration limits
- **User Segments**: Target specific user types
- **Priority System**: Control display order

### **Content Management**
- Rich text content (title, description, button text)
- Image support with URLs
- Custom links and call-to-action buttons
- HTML content support

## 🚀 Getting Started

### **1. Database Setup**

Run the migration to create the popup_ads table:

```bash
# Apply the migration
npx supabase db push
```

### **2. Access Admin Panel**

Navigate to: `Admin → Frontend UI → Popup Ads`

### **3. Create Your First Popup Ad**

1. Click "Create Popup Ad"
2. Fill in basic information (title, slug, type, position)
3. Add content (image, text, links)
4. Configure display settings (delay, duration, priority)
5. Set platform targeting (mobile/desktop/tablet)
6. Schedule start/end dates
7. Set status to "Published"

## 📱 Frontend Integration

### **Fetch Active Popup Ads**

```typescript
// For web layout
const response = await fetch('/api/popup-ads?device=desktop&path=/home')
const { popupAds } = await response.json()

// For mobile layout
const response = await fetch('/api/popup-ads?device=mobile&path=/m/home')
const { popupAds } = await response.json()
```

### **API Parameters**

- `device`: `mobile`, `desktop`, `tablet`, or `all`
- `path`: Current page path for targeting
- Returns up to 5 active popup ads

### **Display Logic**

The system automatically:
- Filters by device type
- Checks scheduling (start/end dates)
- Applies page targeting rules
- Orders by priority
- Respects display limits

## 🎨 Admin Interface

### **Main Dashboard**
- View all popup ads in a grid layout
- Search and filter by type, status, platform
- Quick actions (edit, delete, duplicate)

### **Create/Edit Form**
- **Basic Information**: Title, slug, type, position, status
- **Content & Media**: Images, text, links, buttons
- **Display Settings**: Timing, duration, priority
- **Platform Settings**: Mobile/Desktop/Tablet toggles
- **Scheduling**: Start/end dates
- **Live Preview**: See how the ad will look

### **Management Features**
- **Status Management**: Draft → Published → Archived
- **Bulk Operations**: Delete multiple ads
- **Analytics Ready**: Track display counts and engagement
- **Version Control**: Edit history and rollbacks

## 🔧 Technical Implementation

### **Database Schema**

```sql
CREATE TABLE popup_ads (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type popup_ad_type NOT NULL,
  position popup_ad_position NOT NULL,
  content JSONB NOT NULL,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  status popup_ad_status NOT NULL,
  priority INTEGER DEFAULT 0,
  display_delay INTEGER DEFAULT 0,
  display_duration INTEGER DEFAULT 0,
  max_display_count INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  show_on_mobile BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true,
  show_on_tablet BOOLEAN DEFAULT true,
  target_pages TEXT[],
  exclude_pages TEXT[],
  user_segments JSONB DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **API Endpoints**

#### **Admin API**
- `GET /api/admin/popup-ads` - List all popup ads with filters
- `POST /api/admin/popup-ads` - Create new popup ad
- `GET /api/admin/popup-ads/[id]` - Get specific popup ad
- `PUT /api/admin/popup-ads/[id]` - Update popup ad
- `DELETE /api/admin/popup-ads/[id]` - Delete popup ad

#### **Public API**
- `GET /api/popup-ads` - Get active popup ads for frontend

### **Component Architecture**

```
src/
├── app/
│   └── admin/frontend-ui/popup-ads/
│       ├── page.tsx                    # Main listing page
│       ├── new/page.tsx                # Create new popup ad
│       └── [id]/page.tsx               # Edit existing popup ad
├── components/admin/popup-ads/
│   ├── PopupAdsList.tsx               # Main list component
│   ├── PopupAdCard.tsx                # Individual popup ad card
│   ├── PopupAdForm.tsx                # Create/edit form
│   └── DeletePopupAdDialog.tsx        # Delete confirmation
├── types/
│   └── popup-ad.ts                    # TypeScript definitions
└── app/api/
    ├── admin/popup-ads/               # Admin API routes
    └── popup-ads/                     # Public API routes
```

## 🎯 Best Practices

### **Content Guidelines**
- Keep titles under 50 characters
- Use clear, action-oriented button text
- Optimize images for web (max 1MB)
- Test on multiple devices before publishing

### **Timing Strategy**
- **Display Delay**: 3-5 seconds for better user experience
- **Duration**: 0 (until dismissed) for important messages
- **Priority**: Higher numbers display first
- **Scheduling**: Use start/end dates for campaigns

### **Targeting Tips**
- **Page Specific**: Target high-conversion pages
- **Device Specific**: Optimize content for each platform
- **User Segments**: Use for personalized experiences
- **A/B Testing**: Create multiple versions with different priorities

## 🚨 Troubleshooting

### **Common Issues**

1. **Popup not displaying**
   - Check if status is "Published"
   - Verify device targeting settings
   - Check scheduling dates
   - Ensure page path is not excluded

2. **Form validation errors**
   - All required fields must be filled
   - Slug must be unique
   - Image URLs must be valid

3. **API errors**
   - Verify Supabase connection
   - Check authentication (admin routes)
   - Validate request payload

### **Debug Mode**

Enable console logging in the browser to see:
- API request/response details
- Form validation errors
- Data loading states

## 🔮 Future Enhancements

- **Analytics Dashboard**: Track views, clicks, conversions
- **A/B Testing**: Compare different ad versions
- **Template System**: Pre-built ad templates
- **Advanced Targeting**: User behavior, location, time
- **Automation**: Auto-scheduling based on performance
- **Multi-language**: International content support

## 📞 Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check browser console for errors
4. Verify database migration status

---

**Built with ❤️ using Next.js 15+ and Supabase**
