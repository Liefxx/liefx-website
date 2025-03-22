import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainLayout from '../components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Liefx - Brody Moore',
  description: 'Official website of Brody Moore (Liefx) - Rocket League host/caster, content creator, and streamer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
