import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/app-header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Energy Audit Writing Assistant',
  description: 'AI-powered assistant for writing energy audit reports',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <AppProviders>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow">
              {children}
            </main>
          </div>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
