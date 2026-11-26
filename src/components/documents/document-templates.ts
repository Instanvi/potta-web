export const DOCUMENT_TEMPLATE_IDS = ['classic', 'editorial', 'ledger', 'statement'] as const;

export type DocumentTemplateId = (typeof DOCUMENT_TEMPLATE_IDS)[number];

export const LETTERHEAD_STORAGE_KEY = 'potta.documentLetterhead';

export type DocumentTemplateSpec = {
  id: DocumentTemplateId;
  name: string;
  description: string;
  header: 'band' | 'open' | 'compact' | 'rail';
  table: 'quiet' | 'open' | 'accent' | 'plain';
  totals: 'right' | 'light' | 'under' | 'card';
};

export const DOCUMENT_TEMPLATES: DocumentTemplateSpec[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Accent band across the top, parties below, totals on the right.',
    header: 'band',
    table: 'quiet',
    totals: 'right',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Open white page, large title, and a single accent rule.',
    header: 'open',
    table: 'open',
    totals: 'light',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    description: 'Compact header, a date strip, and an accent table row.',
    header: 'compact',
    table: 'accent',
    totals: 'under',
  },
  {
    id: 'statement',
    name: 'Statement',
    description: 'Accent rail on the left and the total set in a card.',
    header: 'rail',
    table: 'plain',
    totals: 'card',
  },
];

export function isDocumentTemplateId(value: unknown): value is DocumentTemplateId {
  return DOCUMENT_TEMPLATE_IDS.includes(value as DocumentTemplateId);
}

export function documentTemplate(id?: string | null): DocumentTemplateSpec {
  return DOCUMENT_TEMPLATES.find((item) => item.id === id) ?? DOCUMENT_TEMPLATES[0];
}

/** Template saved with the letterhead prefs. Classic when nothing is stored. */
export function readStoredDocumentTemplate(): DocumentTemplateId {
  if (typeof window === 'undefined') return 'classic';
  try {
    const raw = localStorage.getItem(LETTERHEAD_STORAGE_KEY);
    if (!raw) return 'classic';
    const parsed = JSON.parse(raw) as { template?: unknown };
    return isDocumentTemplateId(parsed.template) ? parsed.template : 'classic';
  } catch {
    return 'classic';
  }
}
