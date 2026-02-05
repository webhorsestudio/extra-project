import { detectDeviceFromUserAgent } from '@/lib/device-detection';
import MobileLayout from '@/components/mobile/Layout';
import ServerLayout from '@/components/web/ServerLayout';
// Mobile more page removed - redirect to web version
import WebMore from '../web/more/page';
import { headers } from 'next/headers';

export default async function MorePage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const deviceInfo = detectDeviceFromUserAgent(userAgent);
  const shouldUseMobile = deviceInfo.isMobile;

  if (shouldUseMobile) {
    return (
      <MobileLayout>
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-4">More</h2>
          <p className="text-gray-600">More features coming soon to mobile.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <ServerLayout showCategoryBar={false}>
      <WebMore />
    </ServerLayout>
  );
} 