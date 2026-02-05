import { detectDeviceFromUserAgent } from '@/lib/device-detection';
import MobileLayout from '@/components/mobile/Layout';
import ServerLayout from '@/components/web/ServerLayout';
// Mobile blogs page removed - redirect to web version
import WebBlogs from '../web/blogs/page';
import { headers } from 'next/headers';

export default async function BlogsPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const deviceInfo = detectDeviceFromUserAgent(userAgent);
  const shouldUseMobile = deviceInfo.isMobile;

  if (shouldUseMobile) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-4">Blogs</h2>
          <p className="text-gray-600">Blogs feature coming soon to mobile.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <ServerLayout showCategoryBar={false}>
      <WebBlogs />
    </ServerLayout>
  );
} 