import ServerLayout from '@/components/web/ServerLayout';
import WebHome from './web/page';

export default async function RootPage() {
  return (
    <ServerLayout showCategoryBar={true}>
      <WebHome />
    </ServerLayout>
  );
} 