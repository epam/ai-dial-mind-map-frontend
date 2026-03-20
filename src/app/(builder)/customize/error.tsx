'use client';

import { useEffect } from 'react';

import { AppErrorBanner } from '@/components/common/AppErrorBanner';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error boundary:', error);
  }, [error]);

  return <AppErrorBanner onReload={reset} />;
}
