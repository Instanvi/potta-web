import { redirect } from 'next/navigation';

/** /customers used to be the customer module root. */
export default function CustomersIndexRedirect() {
  redirect('/contacts?type=customers');
}
