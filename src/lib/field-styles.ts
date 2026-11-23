/**
 * One Potta field surface — talk-FE underline: zinc-50 fill, bottom border only.
 * Use these everywhere (page canvas, sheets, document forms, search).
 */
export const FIELD_INPUT =
  'flex h-10 w-full min-w-0 rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-zinc-50 px-3 py-1.5 text-sm font-normal leading-none text-foreground shadow-none outline-none transition-colors placeholder:text-black/35 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export const FIELD_SELECT =
  'flex h-10 w-full appearance-none items-center justify-between rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-zinc-50 px-3 text-sm leading-none text-foreground shadow-none outline-none transition-colors focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export const FIELD_TEXTAREA =
  'flex min-h-[80px] w-full rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-zinc-50 px-3 py-2 text-sm font-normal text-foreground shadow-none outline-none transition-colors placeholder:text-black/35 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

/** @deprecated Same as FIELD_* — kept so existing sheet imports keep working. */
export const SHEET_FIELD_INPUT = FIELD_INPUT;
export const SHEET_FIELD_SELECT = FIELD_SELECT;
export const SHEET_FIELD_TEXTAREA = FIELD_TEXTAREA;

/** Black, legible form labels. */
export const FIELD_LABEL = 'mb-1 block text-sm font-normal text-foreground';

/** @deprecated Same as FIELD_LABEL. */
export const SHEET_FIELD_LABEL = FIELD_LABEL;

/** Hide native number spinners so amount fields match text inputs. */
export const FIELD_NO_SPIN =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
