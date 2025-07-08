import React from 'react';

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 flex flex-col justify-center min-h-[360px] w-full max-w-xl relative">
      {children}
    </div>
  );
} 