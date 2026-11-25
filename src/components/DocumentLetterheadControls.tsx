'use client';

import Image from 'next/image';
import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import {
  INSTANVI_ICON_SVG,
  POTTA_LOGO_SVG,
  type DocumentLetterheadLogo,
} from '@/lib/brand';
import { orgDisplayName, useOrganizationProfile } from '@/hooks/use-organization-profile';
import { cn } from '@/lib/utils';
import { DocumentFormCard, DocumentSectionTitle } from '@/components/document-form-layout';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';

const ACCENTS = [
  { name: 'Forest', value: '#0b5d1e' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Blue', value: '#1d4ed8' },
  { name: 'Slate', value: '#334155' },
  { name: 'Rose', value: '#be123c' },
];

const LOGO_OPTIONS: {
  value: DocumentLetterheadLogo;
  label: string;
  hint: string;
}[] = [
  { value: 'org', label: 'Organization', hint: 'Your uploaded logo' },
  { value: 'potta', label: 'Potta', hint: 'Potta mark' },
  { value: 'instanvi', label: 'Instanvi', hint: 'Instanvi mark' },
  { value: 'none', label: 'None', hint: 'Text only' },
];

/** Letterhead choices for document editors — logo source, tagline, accent. */
export function DocumentLetterheadControls({
  className,
  flush,
}: {
  className?: string;
  flush?: boolean;
}) {
  const { prefs, setPrefs } = useDocumentLetterhead();
  const { data: org } = useOrganizationProfile();
  const orgName = orgDisplayName(org) || 'Organization';
  const orgLogo = (org?.logo || '').trim();

  return (
    <DocumentFormCard flush={flush} className={className}>
      <DocumentSectionTitle>Letterhead</DocumentSectionTitle>
      <p className="mb-4 text-sm text-muted-foreground">
        Default logo, tagline, and accent for invoices, bills, and other documents.
        Potta and Instanvi marks stay available when you have no org logo yet.
      </p>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-7">
          <Label className="text-xs font-medium">Logo</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LOGO_OPTIONS.map((opt) => {
              const selected = prefs.logo === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPrefs({ logo: opt.value })}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-[2px] border px-2 py-3 text-center transition-colors',
                    selected
                      ? 'border-primary bg-brand-subtle text-foreground'
                      : 'border-black/[0.08] bg-white hover:bg-black/[0.02]',
                  )}
                >
                  <span className="flex h-10 w-full items-center justify-center">
                    {opt.value === 'org' ? (
                      orgLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={orgLogo}
                          alt={orgName}
                          className="h-8 max-w-[4.5rem] object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No logo</span>
                      )
                    ) : null}
                    {opt.value === 'potta' ? (
                      <Image
                        src={POTTA_LOGO_SVG}
                        alt="Potta"
                        width={72}
                        height={28}
                        className="h-7 w-auto object-contain"
                      />
                    ) : null}
                    {opt.value === 'instanvi' ? (
                      <Image
                        src={INSTANVI_ICON_SVG}
                        alt="Instanvi"
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                      />
                    ) : null}
                    {opt.value === 'none' ? (
                      <span className="text-xs text-muted-foreground">Aa</span>
                    ) : null}
                  </span>
                  <span className="text-xs font-medium">{opt.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-5">
          <div className="space-y-1.5">
            <Label htmlFor="letterhead-tagline" className="text-xs font-medium">
              Tagline / extra header text
            </Label>
            <Input
              id="letterhead-tagline"
              value={prefs.tagline}
              onChange={(e) => setPrefs({ tagline: e.target.value })}
              placeholder="Optional line under your name"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Accent color</Label>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  onClick={() => setPrefs({ accent: c.value })}
                  className={cn(
                    'size-8 rounded-full border-2 transition-transform',
                    prefs.accent === c.value
                      ? 'scale-110 border-foreground'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <input
                type="color"
                value={prefs.accent}
                onChange={(e) => setPrefs({ accent: e.target.value })}
                className="size-8 cursor-pointer rounded-full border border-black/10 bg-transparent p-0"
                title="Custom color"
              />
            </div>
          </div>
        </div>
      </div>
    </DocumentFormCard>
  );
}
