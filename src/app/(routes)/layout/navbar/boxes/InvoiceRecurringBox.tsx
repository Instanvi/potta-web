import React from 'react';

const InvoiceRecurringBox = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Active Subscriptions</h3>
        <p className="text-2xl font-medium">32</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Monthly Revenue</h3>
        <p className="text-2xl font-medium">$8,450</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Next Billing</h3>
        <p className="text-2xl font-medium">7 invoices</p>
      </div>
    </div>
  );
};

export default InvoiceRecurringBox;