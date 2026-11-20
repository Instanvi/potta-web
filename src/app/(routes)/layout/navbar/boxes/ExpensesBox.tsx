import React from 'react';

const ExpensesBox = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Total Expenses</h3>
        <p className="text-2xl font-medium">$18,750</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Monthly Average</h3>
        <p className="text-2xl font-medium">$4,250</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Top Category</h3>
        <p className="text-2xl font-medium">Office Supplies</p>
      </div>
    </div>
  );
};

export default ExpensesBox;