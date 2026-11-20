import React from 'react';

const PaymentsBox = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Total Payments</h3>
        <p className="text-2xl font-medium">$24,500</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Pending Payments</h3>
        <p className="text-2xl font-medium">$3,200</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Overdue Payments</h3>
        <p className="text-2xl font-medium">$1,800</p>
      </div>
    </div>
  );
};

export default PaymentsBox;