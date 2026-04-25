import React from 'react';

const InvoicePurchaseBox = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Total Orders</h3>
        <p className="text-2xl font-medium">87</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Completed</h3>
        <p className="text-2xl font-medium text-green-600">64</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">In Progress</h3>
        <p className="text-2xl font-medium text-yellow-600">15</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Cancelled</h3>
        <p className="text-2xl font-medium text-red-600">8</p>
      </div>
    </div>
  );
};

export default InvoicePurchaseBox;