'use client';

import React from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
