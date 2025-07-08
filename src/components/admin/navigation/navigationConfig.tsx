import { 
  Home, 
  Building2, 
  Users, 
  MessageSquare, 
  Settings, 
  FileText, 
  BookOpen, 
  Tag, 
  Globe, 
  Palette, 
  Paintbrush, 
  Phone, 
  Search, 
  Key, 
  Plus, 
  MapPin, 
  Dumbbell,
  Bell,
  HelpCircle,
  Layout,
  FileCheck,
  Building,
  Calendar,
  HomeIcon
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: string
  subItems?: NavigationItem[]
}

export const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'Home' },
  {
    name: 'Properties',
    href: '/admin/properties',
    icon: 'Building2',
    subItems: [
      { name: 'All Properties', href: '/admin/properties', icon: 'Building2' },
      { name: 'Add New Property', href: '/admin/properties/add', icon: 'Plus' },
      { name: 'Location', href: '/admin/properties/location', icon: 'MapPin' },
      { name: 'Category', href: '/admin/properties/category', icon: 'Tag' },
      { name: 'Amenities', href: '/admin/properties/amenities', icon: 'Dumbbell' },
      { name: 'Developer List', href: '/admin/properties/developers', icon: 'Building' },
    ]
  },
  { name: 'Users', href: '/admin/users', icon: 'Users' },
  {
    name: 'Inquiries',
    href: '/admin/inquiries',
    icon: 'MessageSquare',
    subItems: [
      { name: 'All Inquiries', href: '/admin/inquiries', icon: 'MessageSquare' },
      { name: 'Property Inquiries', href: '/admin/inquiries/property', icon: 'HomeIcon' },
      { name: 'Tour Booking', href: '/admin/inquiries/tour', icon: 'Calendar' },
      { name: 'Contact', href: '/admin/inquiries/contact', icon: 'Phone' },
      { name: 'Support', href: '/admin/inquiries/support', icon: 'HelpCircle' },
    ]
  },
  { name: 'Notifications', href: '/admin/notifications', icon: 'Bell' },
  { name: 'Pages', href: '/admin/pages', icon: 'FileText' },
  {
    name: 'FAQs',
    href: '/admin/faqs',
    icon: 'HelpCircle',
    subItems: [
      { name: 'All FAQs', href: '/admin/faqs', icon: 'FileText' },
      { name: 'Categories', href: '/admin/faqs/categories', icon: 'Tag' },
      { name: 'Add New FAQ', href: '/admin/faqs/new', icon: 'Plus' },
    ]
  },
  {
    name: 'Blogs',
    href: '/admin/blogs',
    icon: 'BookOpen',
    subItems: [
      { name: 'All Posts', href: '/admin/blogs', icon: 'FileText' },
      { name: 'Categories', href: '/admin/blogs/categories', icon: 'Tag' },
    ]
  },
  {
    name: 'Frontend UI',
    href: '/admin/frontend-ui/footer',
    icon: 'Layout',
    subItems: [
      { name: 'Footer Design', href: '/admin/frontend-ui/footer', icon: 'Layout' },
      { name: 'Policies Design', href: '/admin/frontend-ui/policies', icon: 'FileCheck' },
    ]
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: 'Settings',
    subItems: [
      { name: 'Website Info', href: '/admin/settings/website', icon: 'Globe' },
      { name: 'Branding', href: '/admin/settings/branding', icon: 'Palette' },
      { name: 'Theme', href: '/admin/settings/theme', icon: 'Paintbrush' },
      { name: 'Contact Info', href: '/admin/settings/contact', icon: 'Phone' },
      { name: 'SEO & Sitemap', href: '/admin/settings/seo', icon: 'Search' },
      { name: 'Keys & Credentials', href: '/admin/settings/api-keys', icon: 'Key' },
    ]
  },
] 