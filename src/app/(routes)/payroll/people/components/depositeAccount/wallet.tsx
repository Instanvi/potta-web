import Input from '@potta/components/input';
import Select from '@potta/components/select';
import React from 'react';

const Wallets = () => {
  return (
    <div>
      <div className="mt-5">
        <p className="mb-2">Wallet Provider</p>
        <Select
          options={[{ label: 'Current Account', value: 'Current Account' }]}
          selectedValue={'Current Account'}
          onChange={undefined}
          bg={''}
        />
      </div>
      <div className="grid mt-5 grid-cols-2 gap-2">
        <div className="mt-5">
          <p>Wallet ID</p>
          <Input type={'number'} name={''} placeholder="+237" />
        </div>
        <div className="mt-5">
          <p>Confirm Wallet ID</p>
          <Input type={''} name={''} placeholder="+237" />
        </div>
      </div>
      <div className="grid grid-cols-1">
        <div className="mt-5">
          <p>Account Holder Name</p>
          <Input type={''} name={''} placeholder="Employee Name" />
        </div>
      </div>
    </div>
  );
};
export default Wallets;
