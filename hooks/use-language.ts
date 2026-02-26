'use client';

import { useContext } from 'react';
import { LanguageContext } from '@/context/language-context';
import { getTranslation } from '@/lib/i18n';

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for cases where context is not available
    return {
      language: 'ja' as const,
      setLanguage: () => {},
      t: getTranslation('ja'),
    };
  }
  return context;
}
