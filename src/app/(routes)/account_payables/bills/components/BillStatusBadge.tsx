import type { Icon } from '@phosphor-icons/react';
import {
  Archive,
  Check,
  CheckCircle,
  Clock,
  FileText,
  PencilSimple,
  Warning,
  X,
} from '@phosphor-icons/react';

const STATUS_STYLES: Record<string, { className: string; icon: Icon; label: string }> = {
  DRAFT: { className: 'bg-gray-50 text-gray-600 border-gray-200', icon: PencilSimple, label: 'Draft' },
  ISSUED: { className: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText, label: 'Issued' },
  PENDING: { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
  APPROVED: { className: 'bg-green-50 text-green-700 border-green-200', icon: Check, label: 'Approved' },
  REJECTED: { className: 'bg-red-50 text-red-700 border-red-200', icon: X, label: 'Rejected' },
  PAID: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Paid' },
  OVERDUE: { className: 'bg-orange-50 text-orange-700 border-orange-200', icon: Warning, label: 'Overdue' },
  ARCHIVED: { className: 'bg-gray-50 text-gray-500 border-gray-200', icon: Archive, label: 'Archived' },
};

const BillStatusBadge = ({ status }: { status: string }) => {
  const style = STATUS_STYLES[status] ?? {
    ...STATUS_STYLES.DRAFT,
    label: status.charAt(0) + status.slice(1).toLowerCase(),
  };
  const StatusIcon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <StatusIcon size={14} weight="bold" />
      {style.label}
    </span>
  );
};

export default BillStatusBadge;
