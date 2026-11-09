'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import { Can } from '@/components/auth/can';
import RootLayout from '../../../layout';
import { PageContainer, PageHeader } from '../../../_shared/states';
import useGetOneInvoice from '../../invoice/_hooks/useGetOneInvoice';
import usePayInvoice from '../../invoice/_hooks/usePayInvoice';
import {
  INVOICE_PAYMENT_METHODS,
  InvoicePaymentMethod,
} from '../../invoice/_utils/types';

const PAYABLE_STATUSES = ['APPROVED', 'OVERDUE'];

const methodLabel = (method: string) =>
  method
    .replace('ACH_TRANSAFER', 'ACH_TRANSFER')
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

const PayNowPage = () => {
  const params = useParams();
  const invoiceId = (params?.invoiceid as string) || '';
  const { data: invoice, isLoading, error } = useGetOneInvoice(invoiceId);
  const payMutation = usePayInvoice(invoiceId);
  const [paymentMethod, setPaymentMethod] =
    useState<InvoicePaymentMethod>('CASH');
  const [paymentReference, setPaymentReference] = useState('');

  const total = Number(invoice?.invoiceTotal ?? 0);
  const currency: string = invoice?.currency || '';
  const status: string = invoice?.status || '';
  const canPay = PAYABLE_STATUSES.includes(status);
  const customerName = invoice?.customer
    ? [invoice.customer.firstName, invoice.customer.lastName]
        .filter(Boolean)
        .join(' ') || invoice.customer.email
    : '';

  const handlePay = () => {
    payMutation.mutate({
      paymentMethod,
      amount: total,
      paymentReference: paymentReference.trim() || undefined,
    });
  };

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Record invoice payment"
          description="Record a payment already collected for an approved or overdue invoice."
        />
        <div className="dashboard-panel mx-auto max-w-md p-8">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading invoice...
            </div>
          ) : error || !invoice ? (
            <div className="py-10 text-center text-destructive">
              Invoice not found.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="text-gray-500 text-sm">
                  Invoice {invoice.invoiceId || invoice.code || invoice.uuid}
                  {customerName ? ` · ${customerName}` : ''}
                </div>
                <div className="text-gray-700 font-medium">Amount Due</div>
                <div className="text-4xl font-semibold tabular-nums text-primary">
                  {total.toLocaleString()} {currency}
                </div>
                <span className="text-xs uppercase tracking-wide px-2 py-0.5 border border-gray-300 text-gray-600">
                  {status}
                </span>
              </div>

              {status === 'PAID' ? (
                <div className="text-center font-medium text-primary">
                  This invoice has been paid.
                </div>
              ) : !canPay ? (
                <div className="text-center text-gray-600 text-sm">
                  Only approved or overdue invoices can be paid. Approve the
                  invoice first.
                </div>
              ) : (
                <Can resource="Invoice" action={['pay', 'update']}>
                  <div className="flex flex-col gap-4">
                    <Select
                      label="Payment method"
                      options={INVOICE_PAYMENT_METHODS.map((m) => ({
                        value: m,
                        label: methodLabel(m),
                      }))}
                      selectedValue={paymentMethod}
                      onChange={(value: InvoicePaymentMethod) =>
                        setPaymentMethod(value)
                      }
                      bg="bg-white"
                    />
                    <Input
                      type="text"
                      name="paymentReference"
                      label="Payment reference (optional)"
                      placeholder="e.g. mobile money transaction ID"
                      value={paymentReference}
                      onchange={(e) => setPaymentReference(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      This records a payment already collected for the full
                      invoice total.
                    </p>
                    <Button
                      onClick={handlePay}
                      text={`Record payment of ${total.toLocaleString()} ${currency}`}
                      type="button"
                      isLoading={payMutation.isPending}
                      disabled={payMutation.isPending}
                      width="full"
                    />
                  </div>
                </Can>
              )}

              <Link
                href="/account_receivables/invoice"
                className="text-center text-sm text-primary hover:underline"
              >
                Back to invoices
              </Link>
            </div>
          )}
        </div>
      </PageContainer>
    </RootLayout>
  );
};

export default PayNowPage;
