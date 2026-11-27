'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { cn } from '@potta/lib/utils';

const UPDATE_DELAY_MS = 700;
/** Let the PDF plugin paint the covered frame before we bring it forward. */
const REVEAL_DELAY_MS = 280;

type SlotUrl = string | null;

/**
 * Stable signature of the document props. Skips a rebuild when a parent
 * re-render produces a new element with the same content (query refetch,
 * letterhead object identity, and so on).
 */
function documentSignature(node: ReactElement<DocumentProps>): string {
  const props = (node as { props?: unknown }).props ?? null;
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(props, (_key, value: unknown) => {
      if (typeof value === 'function') return undefined;
      if (value && typeof value === 'object') {
        if (seen.has(value)) return undefined;
        seen.add(value);
        if ('$$typeof' in value) return undefined;
      }
      return value;
    });
  } catch {
    return '';
  }
}

function withViewerHash(url: string) {
  return `${url}#toolbar=0&navpanes=0`;
}

/**
 * Live PDF preview.
 *
 * react-pdf's PDFViewer writes each new blob straight into the iframe `src`.
 * The browser unloads the page that is on screen, so the pane flashes white
 * every time the form changes. This keeps two frames: the one you see stays
 * up until the next PDF has finished loading, then we swap.
 */
export function PdfPreview({ document }: { document: ReactElement<DocumentProps> }) {
  const [slots, setSlots] = useState<[SlotUrl, SlotUrl]>([null, null]);
  const [visible, setVisible] = useState<0 | 1>(0);
  const [painted, setPainted] = useState(false);
  const [pending, setPending] = useState(false);

  const slotsRef = useRef<[SlotUrl, SlotUrl]>([null, null]);
  const visibleRef = useRef<0 | 1>(0);
  const paintedRef = useRef(false);
  const lastSignature = useRef('');
  const revealTimers = useRef<number[]>([]);
  const documentRef = useRef(document);
  documentRef.current = document;

  const placeUrl = useCallback((url: string) => {
    const current = slotsRef.current;
    const empty = !current[0] && !current[1];
    const target: 0 | 1 = empty ? 0 : visibleRef.current === 0 ? 1 : 0;
    const replaced = current[target];
    if (replaced && replaced !== url) URL.revokeObjectURL(replaced);
    const next: [SlotUrl, SlotUrl] = [current[0], current[1]];
    next[target] = url;
    slotsRef.current = next;
    setSlots(next);
  }, []);

  const reveal = useCallback((index: 0 | 1, url: string) => {
    if (slotsRef.current[index] !== url) return;
    visibleRef.current = index;
    paintedRef.current = true;
    setVisible(index);
    setPainted(true);
    setPending(false);
  }, []);

  useEffect(() => {
    const signature = documentSignature(document);
    if (signature && signature === lastSignature.current) return;

    let cancelled = false;
    if (paintedRef.current) setPending(true);

    const handle = window.setTimeout(async () => {
      try {
        const { pdf } = await import('@react-pdf/renderer');
        const blob = await pdf(documentRef.current).toBlob();
        if (cancelled) return;
        if (signature) lastSignature.current = signature;
        placeUrl(URL.createObjectURL(blob));
      } catch (error) {
        if (!cancelled) {
          console.error('PDF preview failed', error);
          setPending(false);
        }
      }
    }, paintedRef.current ? UPDATE_DELAY_MS : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [document, placeUrl]);

  useEffect(() => {
    return () => {
      revealTimers.current.forEach((id) => window.clearTimeout(id));
      slotsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <div className="relative h-full min-h-0 bg-white">
      {/* Opaque underlay so a loading iframe never flashes through. */}
      <div className="absolute inset-0 z-0 bg-white" aria-hidden />
      {([0, 1] as const).map((index) => {
        const url = slots[index];
        if (!url) return null;
        const showing = painted && visible === index;
        return (
          <iframe
            key={`${index}-${url}`}
            title={showing ? 'Document preview' : ''}
            src={withViewerHash(url)}
            aria-hidden={!showing}
            onLoad={() => {
              const loaded = url;
              const id = window.setTimeout(() => reveal(index, loaded), REVEAL_DELAY_MS);
              revealTimers.current.push(id);
            }}
            className={cn(
              'absolute inset-0 h-full w-full border-0 bg-white transition-opacity duration-150',
              showing ? 'z-10 opacity-100' : 'pointer-events-none z-[1] opacity-0',
            )}
          />
        );
      })}
      {!painted ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white text-sm text-muted-foreground">
          Loading PDF preview…
        </div>
      ) : pending ? (
        <div
          className="pointer-events-none absolute right-3 top-3 z-20 rounded-[2px] bg-black/50 px-2 py-1 text-[11px] text-white"
          aria-hidden
        >
          Updating…
        </div>
      ) : null}
    </div>
  );
}
