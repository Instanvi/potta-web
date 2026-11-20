'use client';

import Input from '@potta/components/input';
import Select from '@potta/components/select';
import react, { useState } from 'react';

const EmployeeTaxInformation = () => {
  const [state, setState] = useState('');
  return (
    <div className="w-full  pt-10 px-14">
      <div className="w-full">
        <Input
          type={'number'}
          placeholder={'0000000000'}
          name={''}
          label=" Tax Payer Number"
        />
      </div>
      {/* <div className="w-full mt-5">
        <Input
          type={'number'}
          placeholder={'000'}
          name={''}
          label=" Tax Exemption"
        />
      </div> */}
    </div>
  );
};
export default EmployeeTaxInformation;
