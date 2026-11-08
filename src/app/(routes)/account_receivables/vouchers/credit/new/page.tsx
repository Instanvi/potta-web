import { redirect } from 'next/navigation';

export default function VoucherNewCreditNoteRedirect() {
  redirect('/account_receivables/credit/new');
}
