import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DarkModeProvider from '@/components/DarkModeProvider';
import { fetchGlobalPageSettings } from '@/lib/generate-page-metadata';
import { renderRootLayoutHeadCode } from '@/lib/parse-head-html';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ycode - Visual Website Builder',
  description: 'Self-hosted visual website builder',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headElements: React.ReactNode[] = [];

  try {
    const globalSettings = await fetchGlobalPageSettings();
    if (globalSettings.globalCustomCodeHead) {
      headElements = renderRootLayoutHeadCode(globalSettings.globalCustomCodeHead);
    }
  } catch {
    // Supabase not configured — skip custom code
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {headElements}
      </head>
      <body className={`${inter.variable} font-sans antialiased text-xs`} suppressHydrationWarning>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}
