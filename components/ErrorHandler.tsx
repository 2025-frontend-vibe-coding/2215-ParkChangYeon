'use client';

import { useEffect } from 'react';
import { setupErrorHandler } from '@/lib/errorHandler';

export default function ErrorHandler() {
  useEffect(() => {
    const cleanup = setupErrorHandler();
    return cleanup;
  }, []);

  return null;
}

