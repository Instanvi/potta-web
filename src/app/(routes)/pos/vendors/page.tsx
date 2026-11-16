import { redirect } from 'next/navigation';

export default function PosVendorsRedirect() {
  redirect('/pos/contacts?type=vendors');
}
