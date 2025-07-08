import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthHeaderProps {
  logoUrl?: string | null;
  logoAlt?: string;
  icon?: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthHeader({ logoUrl, logoAlt, icon, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-4">
      {logoUrl ? (
        <div className="flex justify-center mb-4">
          <Image src={logoUrl} alt={logoAlt || 'Logo'} width={128} height={48} className="object-contain" priority />
        </div>
      ) : icon ? (
        <div className="flex justify-center mb-4">{icon}</div>
      ) : null}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm lg:text-base text-gray-600 mb-2 lg:mb-4">{subtitle}</p>
    </div>
  );
} 