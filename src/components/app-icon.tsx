import type { HTMLAttributes } from 'react';
import { cn } from '@potta/lib/utils';

/** Monochrome SVG (public path) painted with currentColor through a CSS mask, as in instanvi-payroll-expense-fe. */
export function AppIcon({ src, className, style, ...props }: HTMLAttributes<HTMLSpanElement> & { src: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-5 shrink-0 bg-current', className)}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        ...style,
      }}
      {...props}
    />
  );
}

export const APP_ICONS = {
  budget: '/icons/app/expense/budget.svg',
  transactions: '/icons/app/expense/transactions.svg',
  money: '/icons/app/expense/money.svg',
  reimbursement: '/icons/app/expense/reimbursement.svg',
  bills: '/icons/app/expense/bills.svg',
  shoppingCart: '/icons/app/expense/shopping-cart.svg',
  report: '/icons/app/expense/report.svg',
  home: '/icons/app/payroll/home.svg',
  analytics: '/icons/app/payroll/analytics.svg',
  people: '/icons/app/payroll/people.svg',
  clock: '/icons/app/payroll/clock.svg',
  taxes: '/icons/app/payroll/taxes.svg',
  piggyBank: '/icons/app/payroll/piggy-bank.svg',
} as const;
