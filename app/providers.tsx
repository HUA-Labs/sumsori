'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@hua-labs/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" enableSystem enableTransition>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
