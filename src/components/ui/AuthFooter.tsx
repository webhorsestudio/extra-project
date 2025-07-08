import Link from 'next/link';

export function AuthFooter({ companyName }: { companyName: string }) {
  return (
    <div className="text-center space-y-3 lg:space-y-4 mt-6">
      <div className="flex justify-center space-x-4 lg:space-x-6 text-xs lg:text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">Home</Link>
        <Link href="/properties" className="text-gray-500 hover:text-gray-700 transition-colors">Properties</Link>
        <Link href="/contact" className="text-gray-500 hover:text-gray-700 transition-colors">Contact</Link>
      </div>
      <p className="text-xs text-gray-400">
        © 2024 {companyName}. All rights reserved.
      </p>
    </div>
  );
} 