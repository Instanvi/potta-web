/**
 * Other Instanvi apps, mirrored from instanvi-auth-frontend/lib/constants/apps.ts.
 * Links go through the hub so the user lands in the app already signed in.
 */
export interface InstanviApp {
  id: string;
  name: string;
  slug: string;
  logo: string;
  url: string;
}

const SPEND_URL = 'https://spend.instanvi.com';

export const INSTANVI_APPS: InstanviApp[] = [
  { id: 'talk', name: 'Talk', slug: 'talk', logo: '/icons/talk.svg', url: 'https://talk.instanvi.com' },
  { id: 'pay', name: 'Pay', slug: 'pay', logo: '/icons/payment.svg', url: 'https://payment.instanvi.com' },
  { id: 'payroll', name: 'Payroll', slug: 'payroll', logo: '/icons/people.svg', url: SPEND_URL },
  { id: 'expense', name: 'Expense', slug: 'expense', logo: '/icons/expenseRed.svg', url: SPEND_URL },
];

export const SUPER_APP_URL = process.env.NEXT_PUBLIC_SUPER_APP_URL || 'https://auth.instanvi.com';
