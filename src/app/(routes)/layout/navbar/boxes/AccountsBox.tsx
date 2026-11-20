import React from 'react';

const AccountsBox = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Total Accounts</h3>
        <p className="text-2xl font-medium">12</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Total Balance</h3>
        <p className="text-2xl font-medium">$87,350</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="font-medium text-lg mb-2">Recent Transactions</h3>
        <p className="text-2xl font-medium">24</p>
      </div>
    </div>
  );
};

export default AccountsBox;