import MobileLayout from '@/components/mobile/Layout';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileAppLayout({ children }: MobileLayoutProps) {
  return <MobileLayout>{children}</MobileLayout>;
} 