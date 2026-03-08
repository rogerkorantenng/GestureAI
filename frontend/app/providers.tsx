'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { WelcomeModal } from '@/components/WelcomeModal';
import { useSessionStore } from '@/lib/store';

function SessionUpdater() {
  const { session, updateLastVisit } = useSessionStore();

  useEffect(() => {
    if (session) {
      updateLastVisit();
    }
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionUpdater />
        <WelcomeModal />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
