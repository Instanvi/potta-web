import { redirect } from 'next/navigation';

/** Trade Overview removed — land on products. */
export default function Page() {
  redirect('/inventory');
}
