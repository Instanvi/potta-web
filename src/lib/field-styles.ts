/**
 * Shared Talk-aligned field surfaces for every Potta input, select and textarea.
 * Prefer `@/components/shadcn/input` / `Input` / `Select` when possible; use these
 * classes only for raw HTML controls inside dense editors.
 *
 * Fields use light grey (`bg-field`) on the page canvas and inside white sheets —
 * never pure white on white.
 */
export const FIELD_INPUT =
  'flex h-10 w-full min-w-0 rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-field px-3 py-1.5 text-sm font-normal leading-none text-foreground shadow-none outline-none transition-colors placeholder:text-black/35 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export const FIELD_SELECT =
  'flex h-10 w-full appearance-none rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-field px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export const FIELD_TEXTAREA =
  'flex min-h-[80px] w-full rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-field px-3 py-2 text-sm font-normal text-foreground shadow-none outline-none transition-colors placeholder:text-black/35 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

/** Full light outline — use inside white sheets so fields stay visible. */
export const SHEET_FIELD_INPUT =
  'flex h-10 w-full min-w-0 rounded-[2px] border border-black/15 bg-field px-3 py-1.5 text-sm font-normal leading-none text-foreground shadow-none outline-none transition-colors placeholder:text-black/35 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export const SHEET_FIELD_SELECT =
  'flex h-10 w-full appearance-none rounded-[2px] border border-black/15 bg-field px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export const SHEET_FIELD_TEXTAREA =
  'flex min-h-[80px] w-full rounded-[2px] border border-black/15 bg-field px-3 py-2 text-sm font-normal text-foreground shadow-none outline-none transition-colors placeholder:text-black/35 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

/** Black, legible form labels inside sheets. */
export const SHEET_FIELD_LABEL = 'mb-1 block text-sm font-normal text-foreground';
