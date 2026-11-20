import { redirect } from 'next/navigation';

export default function ReceivableCustomersRedirect() {
  redirect('/account_receivables/contacts?type=customers');
}
