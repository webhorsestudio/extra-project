import ServerLayout from '@/components/web/ServerLayout'
import { PublicPropertyForm } from '@/components/web/properties/PublicPropertyForm'

export default function AddPropertyPage() {
  return (
    <ServerLayout showCategoryBar={false}>
      <PublicPropertyForm />
    </ServerLayout>
  )
} 