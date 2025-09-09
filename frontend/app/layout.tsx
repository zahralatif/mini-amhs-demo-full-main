'use client';
import ThemeProviderClient from '../theme/ThemeProviderClient';
import { AuthProvider } from '@/lib/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProviderClient>{children}</ThemeProviderClient>
        </AuthProvider>
      </body>
    </html>
  );
}
