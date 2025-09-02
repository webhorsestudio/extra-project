import ServerLayout from '@/components/web/ServerLayout'

export default function PublicListingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServerLayout showCategoryBar={false}>
      {children}
    </ServerLayout>
  )
}
