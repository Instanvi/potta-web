'use client';

import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import { cn } from '@/lib/utils';
import {
  DOCUMENT_TEMPLATES,
  type DocumentTemplateSpec,
} from '@/components/documents/document-templates';

const SAMPLE = {
  seller: 'Northwind Studio',
  customer: 'Ada Mensah',
  lines: [
    { item: 'Design review', amount: '300,000' },
    { item: 'Hosting', amount: '25,000' },
  ],
  total: '325,000',
};

function SampleSheet({ spec, accent }: { spec: DocumentTemplateSpec; accent: string }) {
  const band = spec.header === 'band';
  const open = spec.header === 'open';
  const compact = spec.header === 'compact';
  const rail = spec.header === 'rail';
  const accentTable = spec.table === 'accent';
  return (
    <div
      className="relative h-[168px] overflow-hidden rounded-[2px] border border-black/[0.06] bg-white text-left"
      style={rail ? { boxShadow: `inset 6px 0 0 ${accent}` } : undefined}
    >
      {band ? (
        <div className="flex items-start justify-between px-3 py-2 text-white" style={{ backgroundColor: accent }}>
          <div>
            <p className="text-[9px] font-semibold">{SAMPLE.seller}</p>
            <p className="text-[7px] opacity-80">Douala</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide">INVOICE</p>
            <p className="text-[7px] opacity-80">INV-1042</p>
          </div>
        </div>
      ) : null}
      {open ? (
        <div className="px-3 pt-2" style={{ borderBottom: `2px solid ${accent}` }}>
          <p className="text-[13px] font-semibold leading-none text-foreground">Invoice</p>
          <p className="mb-1.5 mt-0.5 text-[7px] text-muted-foreground">INV-1042 · {SAMPLE.seller}</p>
        </div>
      ) : null}
      {compact ? (
        <div>
          <div className="flex items-end justify-between px-3 pt-2">
            <p className="text-[9px] font-semibold">{SAMPLE.seller}</p>
            <p className="text-[10px] font-semibold" style={{ color: accent }}>
              INVOICE
            </p>
          </div>
          <div className="mx-3 mt-1.5 flex justify-between bg-[#f3f4f6] px-1.5 py-1 text-[7px] text-muted-foreground">
            <span>Issue 26 Nov</span>
            <span>Due 26 Dec</span>
            <span>XAF</span>
          </div>
        </div>
      ) : null}
      {rail ? (
        <div className="px-3 pt-2 pl-4">
          <p className="text-[13px] font-semibold leading-none" style={{ color: accent }}>
            Invoice
          </p>
          <p className="text-[7px] text-muted-foreground">{SAMPLE.seller}</p>
        </div>
      ) : null}

      <div className={cn('px-3', rail && 'pl-4', band || open ? 'pt-2' : 'pt-1.5')}>
        <div className="mb-1 flex gap-4 text-[7px] text-muted-foreground">
          <span>From {SAMPLE.seller}</span>
          <span>To {SAMPLE.customer}</span>
        </div>
        <div
          className="flex justify-between px-1 py-0.5 text-[7px] font-semibold uppercase"
          style={
            accentTable
              ? { backgroundColor: accent, color: '#fff' }
              : spec.table === 'open'
                ? { borderBottom: `1px solid ${accent}`, color: '#4b5563' }
                : { backgroundColor: '#f3f4f6', color: '#4b5563' }
          }
        >
          <span>Item</span>
          <span>Amount</span>
        </div>
        {SAMPLE.lines.map((line) => (
          <div key={line.item} className="flex justify-between border-b border-black/[0.06] px-1 py-0.5 text-[7px]">
            <span>{line.item}</span>
            <span>{line.amount}</span>
          </div>
        ))}
        <div
          className={cn(
            'ml-auto mt-1 w-[58%] px-1 py-0.5 text-[7px]',
            spec.totals === 'card' && 'border-l-2 bg-[#f6f8f7]',
          )}
          style={spec.totals === 'card' ? { borderLeftColor: accent } : undefined}
        >
          <div className="flex justify-between font-semibold" style={{ color: spec.totals === 'light' ? '#111' : accent }}>
            <span>Total</span>
            <span>XAF {SAMPLE.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Four filled samples. The selected layout is stored with the letterhead prefs. */
export function DocumentTemplateSamples() {
  const { prefs, setPrefs } = useDocumentLetterhead();
  return (
    <div className="mt-6">
      <h2 className="text-sm font-medium text-foreground">Document template</h2>
      <p className="mb-3 mt-1 text-sm text-muted-foreground">
        One layout for invoices, bills, purchase orders, receipts, and the page a customer opens from a link.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {DOCUMENT_TEMPLATES.map((spec) => {
          const selected = prefs.template === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => setPrefs({ template: spec.id })}
              className={cn(
                'rounded-[2px] border p-3 text-left transition-colors',
                selected
                  ? 'border-primary bg-brand-subtle'
                  : 'border-black/[0.08] bg-white hover:bg-black/[0.02]',
              )}
            >
              <SampleSheet spec={spec} accent={prefs.accent || '#0b5d1e'} />
              <p className="mt-2 text-sm font-medium">{spec.name}</p>
              <p className="text-xs text-muted-foreground">{spec.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
