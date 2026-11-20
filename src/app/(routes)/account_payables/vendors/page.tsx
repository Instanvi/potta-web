import { redirect } from 'next/navigation';

export default function PayableVendorsRedirect() {
  redirect('/account_payables/contacts?type=vendors');
}
