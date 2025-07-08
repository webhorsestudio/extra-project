import Link from 'next/link'

export function FooterCompanyLinks() {
  return (
    <div>
      <h4 className="uppercase font-bold text-white tracking-widest mb-2 text-sm">Company</h4>
      <ul className="space-y-1">
        <li><Link href="/about" className="text-gray-300 hover:text-white transition">About us</Link></li>
        <li><Link href="/blogs" className="text-gray-300 hover:text-white transition">Blog</Link></li>
      </ul>
    </div>
  )
}

export function FooterResourcesLinks() {
  return (
    <div>
      <h4 className="uppercase font-bold text-white tracking-widest mb-2 text-sm">Resources</h4>
      <ul className="space-y-1">
        <li><Link href="/terms" className="text-gray-300 hover:text-white transition">Terms of service</Link></li>
      </ul>
    </div>
  )
} 