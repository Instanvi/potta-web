import { redirect } from 'next/navigation';

export default function PosCustomersRedirect() {
  redirect('/pos/contacts?type=customers');
}
