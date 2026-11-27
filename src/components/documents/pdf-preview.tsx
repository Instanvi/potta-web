'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { cn } from '@potta/lib/utils';

const UPDATE_DELAY_MS = 650;
/** Let the PDF plugin paint the covered frame before we bring it forward. */
const REVEAL_DELAY_MS = 200;

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

  const slotsRef = useRef<[SlotUrl, SlotUrl]>([null, null]);
  const visibleRef = useRef<0 | 1>(0);
  const paintedRef = useRef(false);
  const lastSignature = useRef('');
  const revealTimers = useRef<number[]>([]);

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
  }, []);

  useEffect(() => {
    const signature = documentSignature(document);
    if (signature && signature === lastSignature.current) return;

    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const { pdf } = await import('@react-pdf/renderer');
        const blob = await pdf(document).toBlob();
        if (cancelled) return;
        if (signature) lastSignature.current = signature;
        placeUrl(URL.createObjectURL(blob));
      } catch (error) {
        if (!cancelled) console.error('PDF preview failed', error);
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
    <div className="relative h-full min-h-0 bg-main-bg">
      {([0, 1] as const).map((index) => {
        const url = slots[index];
        if (!url) return null;
        const showing = painted && visible === index;
        return (
          <iframe
            key={index}
            title={showing ? 'Document preview' : ''}
            src={withViewerHash(url)}
            aria-hidden={!showing}
            onLoad={() => {
              const loaded = url;
              const id = window.setTimeout(() => reveal(index, loaded), REVEAL_DELAY_MS);
              revealTimers.current.push(id);
            }}
            className={cn(
              'absolute inset-0 h-full w-full border-0 bg-white',
              showing ? 'z-10' : 'pointer-events-none z-0',
            )}
          />
        );
      })}
      {painted ? null : (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-main-bg text-sm text-muted-foreground">
          Loading PDF preview…
        </div>
      )}
    </div>
  );
}
