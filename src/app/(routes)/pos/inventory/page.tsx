import { redirect } from 'next/navigation';

/** Inventory moved to its own module. */
export default function PosInventoryRedirect() {
  redirect('/inventory');
}
