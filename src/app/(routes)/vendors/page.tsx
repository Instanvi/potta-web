import { redirect } from 'next/navigation';

export default function VendorsRedirect() {
  redirect('/contacts?type=vendors');
}
