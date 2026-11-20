import Input from '@potta/components/input';
import Select from '@potta/components/select';
import React from 'react';

const BankAccount = () => {
  return (
    <div>
      <div className="mt-5">
        <p>Account Type</p>
        <Select
          options={[{ label: 'Current Account', value: 'Current Account' }]}
          selectedValue={'Current Account'}
          onChange={undefined}
          bg={''}
        />
      </div>
      <div className="mt-5">
        <p>Account Type</p>
        <Input type={''} name={''} placeholder="UBA Cameroon" />
      </div>
      <div className="grid mt-5 grid-cols-2 gap-2">
        <div className="mt-5">
          <p>Account Holder Name</p>
          <Input type={''} name={''} placeholder="Employee Name" />
        </div>
        <div className="mt-5">
          <p>Rounting Number</p>
          <Input type={''} name={''} placeholder="000000" />
        </div>
      </div>
      <div className="grid mt-5 grid-cols-2 gap-2">
        <div className="mt-5">
          <p>Account Number</p>
          <Input type={''} name={''} placeholder="0000000" />
        </div>
        <div className="mt-5">
          <p>Confirm Account Number</p>
          <Input type={''} name={''} placeholder="0000000" />
        </div>
      </div>
    </div>
  );
};
export default BankAccount;
