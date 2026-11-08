import {
  Bell,
  CheckCircle,
  CreditCard,
  EnvelopeSimple,
  FileText,
  Package,
  ShieldWarning,
  Truck,
  WarningCircle,
  type Icon,
} from '@phosphor-icons/react';

/** Icon and tint for an inbox row, picked from its type, business event and text. */
export function notificationVisual(input: {
  type?: string | null;
  subject?: string | null;
  title?: string | null;
  content?: string | null;
  metadata?: { businessEvent?: unknown } | null;
}): { Icon: Icon; tone: string } {
  const event = typeof input.metadata?.businessEvent === 'string' ? input.metadata.businessEvent : '';
  const hay = `${input.type ?? ''} ${event} ${input.subject ?? ''} ${input.title ?? ''} ${input.content ?? ''}`.toLowerCase();

  if (/fail|declin|error|reject|overdue|chargeback/.test(hay)) {
    return { Icon: WarningCircle, tone: 'bg-red-50 text-red-600' };
  }
  if (/approv|complet|success|paid/.test(hay)) {
    return { Icon: CheckCircle, tone: 'bg-green-50 text-green-700' };
  }
  if (/payment|payout|wallet|cashbook|bank/.test(hay)) {
    return { Icon: CreditCard, tone: 'bg-green-50 text-green-700' };
  }
  if (/invoice|bill|credit.?note|receipt|voucher/.test(hay)) {
    return { Icon: FileText, tone: 'bg-sky-50 text-sky-700' };
  }
  if (/purchase|order|vendor|supplier|deliver/.test(hay)) {
    return { Icon: Truck, tone: 'bg-amber-50 text-amber-700' };
  }
  if (/stock|inventory|product|item|restock/.test(hay)) {
    return { Icon: Package, tone: 'bg-teal-50 text-teal-700' };
  }
  if (/sign.?in|login|security|password|session|role|permission/.test(hay)) {
    return { Icon: ShieldWarning, tone: 'bg-emerald-50 text-emerald-700' };
  }
  if (/invit|email|mail/.test(hay)) {
    return { Icon: EnvelopeSimple, tone: 'bg-teal-50 text-teal-700' };
  }
  return { Icon: Bell, tone: 'bg-black/[0.04] text-black/55' };
}
