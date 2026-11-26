'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DocumentLetterheadLogo } from '@/lib/brand';
import {
  LETTERHEAD_STORAGE_KEY,
  isDocumentTemplateId,
  type DocumentTemplateId,
} from '@/components/documents/document-templates';

export type DocumentLetterheadPrefs = {
  logo: DocumentLetterheadLogo;
  tagline: string;
  accent: string;
  template: DocumentTemplateId;
};

const STORAGE_KEY = LETTERHEAD_STORAGE_KEY;
const DEFAULT_PREFS: DocumentLetterheadPrefs = {
  logo: 'org',
  tagline: '',
  accent: '#0b5d1e',
  template: 'classic',
};

function readPrefs(): DocumentLetterheadPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<DocumentLetterheadPrefs>;
    return {
      logo:
        parsed.logo === 'org' ||
        parsed.logo === 'potta' ||
        parsed.logo === 'instanvi' ||
        parsed.logo === 'none'
          ? parsed.logo
          : DEFAULT_PREFS.logo,
      tagline: typeof parsed.tagline === 'string' ? parsed.tagline : '',
      accent:
        typeof parsed.accent === 'string' && parsed.accent.trim()
          ? parsed.accent
          : DEFAULT_PREFS.accent,
      template: isDocumentTemplateId(parsed.template) ? parsed.template : DEFAULT_PREFS.template,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Persisted letterhead choices shared across document create/edit screens. */
export function useDocumentLetterhead() {
  const [prefs, setPrefsState] = useState<DocumentLetterheadPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefsState(readPrefs());
    setReady(true);
  }, []);

  const setPrefs = useCallback((patch: Partial<DocumentLetterheadPrefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { prefs, setPrefs, ready };
}
