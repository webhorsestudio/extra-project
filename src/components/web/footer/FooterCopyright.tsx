import Link from 'next/link'

export default function FooterCopyright() {
  return (
    <div className="bg-[#181818] py-4 text-center text-gray-400 text-xs border-t border-gray-800">
      © Copyright 2025, Extra Realty Private Limited - All Rights Reserved | Designed by Webhorse Studio &nbsp;
      <Link href="/terms" className="hover:text-white underline">Terms & Conditions</Link>
      &nbsp;|&nbsp;
      <Link href="/privacy" className="hover:text-white underline">Privacy policy</Link>
    </div>
  )
} 