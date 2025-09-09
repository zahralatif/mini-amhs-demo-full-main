'use client';
import ThemeProviderClient from '../theme/ThemeProviderClient';
import { AuthProvider } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Mini AMHS - A modern messaging system demo" />
        <title>Mini AMHS</title>
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProviderClient>{children}</ThemeProviderClient>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
