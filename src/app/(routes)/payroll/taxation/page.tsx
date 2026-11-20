import react from 'react';
import RootLayout from '../../layout';

import Input from '@potta/components/input';
import Select from '@potta/components/select';
import MyDropzone from '@potta/components/dropzone';

const Taxation = () => {
  return (
    <RootLayout>
      <div className="md:w-[60%] w-full px-24 pt-10">
        <h1 className="text-xl font-medium">Enter Taxation Information</h1>
        <div className="mt-8">
          <p>
            Enter your 11 digit alpha numeric Taxation ID, Down a sample of
            typical tax payers card below for better reference. Or simply
            request for a new ID and a correspondent from our team will reach
            out to you.
          </p>
        </div>
        <div className="mt-8">
          <h6 className="my-2 ">Enter Federal Tax ID</h6>
          <Select
            options={[{ label: 'Federal', value: 'Federal' }]}
            selectedValue={'Federal'}
            onChange={undefined}
            bg={''}
          />
        </div>
        <div className="flex space-x-4">
          <p className="text-green-900">Download Example</p>
          <p className="text-green-500">Apply for new Tax ID</p>
        </div>
        <div className="mt-9">
          <h3 className="font-medium text-xl mb-5">Additional Information</h3>
          <p>Upload the following infos below for complete tax Compliance</p>
          <p>1-Attestation of localize</p>
          <MyDropzone />
        </div>
      </div>
    </RootLayout>
  );
};
export default Taxation;
