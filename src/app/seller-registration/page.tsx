import ServerLayout from '@/components/web/ServerLayout'
import SellerRegistrationForm from '@/components/web/SellerRegistrationForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seller Registration - Join Our Platform',
  description: 'Register as a seller to list your properties on our platform. Start reaching more buyers today.',
}

export default function SellerRegistrationPage() {
  return (
    <ServerLayout showCategoryBar={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center py-12 px-2 md:px-0">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 md:p-0">
            {/* Modern heading inside card */}
            <div className="px-8 pt-10 pb-4 text-center border-b border-gray-100">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Seller Registration</h1>
              <p className="text-lg text-gray-600 mb-2">Join our platform to list your properties and reach more buyers</p>
            </div>
            {/* Modern form and stepper integration */}
            <div className="px-4 md:px-8 py-8">
              <SellerRegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </ServerLayout>
  )
} 