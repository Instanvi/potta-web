import { CreditNoteStatus } from '../_utils/types';

const styles: Record<CreditNoteStatus, string> = {
  DRAFT: 'border-gray-300 text-gray-600 bg-gray-50',
  PENDING: 'border-yellow-300 text-yellow-700 bg-yellow-50',
  APPROVED: 'border-green-500 text-green-700 bg-green-50',
  REJECTED: 'border-red-300 text-red-600 bg-red-50',
  REFUNDED: 'border-blue-300 text-blue-700 bg-blue-50',
};

const CreditNoteStatusBadge = ({ status }: { status: CreditNoteStatus }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium uppercase border ${
      styles[status] ?? styles.DRAFT
    }`}
  >
    {status}
  </span>
);

export default CreditNoteStatusBadge;
