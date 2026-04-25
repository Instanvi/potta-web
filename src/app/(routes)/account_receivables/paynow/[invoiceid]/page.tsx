'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Button from '@potta/components/button';
import { Tabs, TabsList, TabsTrigger } from '@potta/components/shadcn/tabs';
import Input from '@potta/components/input';

interface TableItem {
  name: string;
  qty: number;
  price: number | string;
  tax: number | string;
  productId: string;
  uuid: string;
  id: number;
}

const getCurrencySymbol = (currencyCode: string): string => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'XAF':
      return 'XAF';
    default:
      return currencyCode;
  }
};

// Placeholder for real SVG icons
const paymentProviders = [
  {
    key: 'mtn',
    label: 'MTN Mobile Money',
    // icon: <MtnIcon />,
  },
  {
    key: 'orange',
    label: 'Orange Money',
    // icon: <OrangeIcon />,
  },
];

const providerDetails = {
  mtn: {
    label: 'MTN Mobile Money',
    icon: (
      <img
        src="https://www.monetbil.com/assets/img/mno/BJ_MTNMOBILEMONEY.png"
        alt="MTN Mobile Money"
        width={32}
        height={32}
        className="mr-2 rounded"
      />
    ),
    ussd: '*126#',
    instructions: (amount: number, code: string) => (
      <>
        <div className="mb-2 text-gray-700">
          Dial <span className="font-mono font-medium">*126#</span> on your phone.
        </div>
      </>
    ),
  },
  orange: {
    label: 'Orange Money',
    icon: (
      <img
        src="https://1000logos.net/wp-content/uploads/2021/02/Orange-Money-emblem.png"
        alt="Orange Money"
        width={32}
        height={32}
        className="mr-2 rounded"
      />
    ),
    ussd: '#150*14#',
    instructions: (amount: number, code: string) => (
      <>
        <div className="mb-2 text-gray-700">
          Dial <span className="font-mono font-medium">#150*14#</span> on your
          phone.
        </div>
      </>
    ),
  },
};

const PayNowPage = () => {
  const params = useParams();
  const invoiceId = params?.invoiceid as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    'mtn' | 'orange' | ''
  >('');
  const [payerNumber, setPayerNumber] = useState('');
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    // TODO: Replace with real API call
    async function fetchInvoice() {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call
        setTimeout(() => {
          setInvoice({
            id: invoiceId,
            invoiceType: 'Invoice',
            invoiceNumber: '0025',
            issueDate: '2024-07-01',
            dueDate: '2024-07-10',
            currency: 'XAF',
            customer: {
              name: 'John Doe',
              email: 'john@example.com',
              address: '123 Main St, City',
              phone: '+237 600 000 000',
            },
            billingAddress: '123 Main St, City',
            paymentReference: 'INV-0025',
            taxRate: 7.5,
            tableData: [
              {
                id: 1,
                name: 'Product A',
                qty: 2,
                price: 10000,
                tax: 7.5,
                productId: 'p1',
                uuid: 'u1',
              },
              {
                id: 2,
                name: 'Product B',
                qty: 1,
                price: 5000,
                tax: 7.5,
                productId: 'p2',
                uuid: 'u2',
              },
            ],
            note: 'Thank you for your business!',
            status: 'unpaid',
            payUrl: '#',
            code: '123456',
          });
          setLoading(false);
        }, 800);
      } catch (e) {
        setError('Failed to load invoice');
        setLoading(false);
      }
    }
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setWaiting(true);
      // alert('Payment processed! (simulate)');
    }, 1200);
  };

  if (loading)
    return <div className="p-10 text-center">Loading invoice...</div>;
  if (error)
    return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!invoice)
    return <div className="p-10 text-center">Invoice not found.</div>;

  const currencySymbol = getCurrencySymbol(invoice.currency);
  const subtotal = invoice.tableData.reduce(
    (sum: number, item: TableItem) =>
      sum + Number(item.price) * Number(item.qty),
    0
  );
  const totalTax = invoice.tableData.reduce(
    (sum: number, item: TableItem) =>
      sum + (Number(item.price) * Number(item.qty) * Number(item.tax)) / 100,
    0
  );
  const total = subtotal + totalTax;

  return (
    <div className="max-w-md mx-auto mt-5 bg-white border border-gray-200 p-8">
      {/* Only show the amount and payment section */}
      <div className="flex flex-col items-center gap-8">
        <div className="text-gray-700 font-medium">Amount Due</div>
        <div className="text-4xl font-extrabold text-green-700">
          {currencySymbol}
          {total.toLocaleString()} XAF
        </div>
        {/* Payment Section */}
        <div className="w-full flex flex-col gap-8">
          {waiting ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-6" />
              <div className="text-xl font-medium text-green-700 mb-2">
                Waiting for payment confirmation…
              </div>
              <div className="text-gray-600 text-center">
                Once your payment is received, your invoice will be marked as
                paid.
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-medium mb-2 text-gray-800">
                Choose Payment Method
              </h2>
              <div className="w-full flex flex-col gap-3">
                {Object.entries(providerDetails).map(([key, p]) => (
                  <div
                    key={key}
                    className={`w-full flex items-center px-4 py-3 border cursor-pointer transition-colors rounded ${
                      selectedProvider === key
                        ? 'border-green-700 bg-green-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    onClick={() => setSelectedProvider(key as 'mtn' | 'orange')}
                  >
                    {p.icon}
                    <span className="font-medium text-base">{p.label}</span>
                    <span className="flex-1" />
                    {selectedProvider === key && (
                      <i className="ri-check-line text-green-700 text-xl" />
                    )}
                  </div>
                ))}
              </div>
              {selectedProvider && (
                <div className="mt-6">
                  <Input
                    type="tel"
                    name="payerNumber"
                    label="Your Mobile Money Number"
                    placeholder="Enter your number"
                    value={payerNumber}
                    onchange={(e) => setPayerNumber(e.target.value)}
                    inputClass="text-lg"
                  />
                  <div className="mt-4">
                    {providerDetails[selectedProvider].instructions(
                      total,
                      invoice.code
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={handlePay}
                text={
                  paying ? 'Processing…' : `Pay ${total.toLocaleString()} XAF`
                }
                type="submit"
                className="w-fit mt-4"
                disabled={paying || !selectedProvider || !payerNumber}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayNowPage;
