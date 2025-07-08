import Link from 'next/link'

interface NavigationLink {
  label: string
  href: string
  isActive: boolean
}

interface NavigationColumn {
  title: string
  links: NavigationLink[]
}

interface FooterNavColumnsProps {
  columns?: NavigationColumn[]
  columnLayout?: string
  alignment?: string
}

export default function FooterNavColumns({ 
  columns,
  columnLayout = '3',
  alignment = 'left'
}: FooterNavColumnsProps) {
  // Use provided columns or fallback to default
  const navColumns = columns || [
    {
      title: 'Company',
      links: [
        { label: 'Websites', href: '#', isActive: true },
        { label: 'Collections', href: '#', isActive: true },
        { label: 'Elements', href: '#', isActive: true },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Academy', href: '#', isActive: true },
        { label: 'Jobs', href: '#', isActive: true },
        { label: 'Market', href: '#', isActive: true },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQs', href: '#', isActive: true },
        { label: 'About Us', href: '#', isActive: true },
        { label: 'Contact Us', href: '#', isActive: true },
      ]
    },
  ]

  // Filter to only show active columns based on layout
  const activeColumns = navColumns.slice(0, parseInt(columnLayout) || 3)

  // Build alignment classes
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  return (
    <div className={`flex flex-col md:flex-row gap-8 md:gap-16 ${alignmentClasses[alignment as keyof typeof alignmentClasses] || 'justify-start'}`}>
      {activeColumns.map((col, idx) => (
        <ul key={idx} className="space-y-2">
          {col.links.filter(link => link.isActive).map(link => (
            <li key={link.label}>
              <Link 
                href={link.href} 
                className="text-white/90 hover:text-white text-base font-medium transition"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
} 