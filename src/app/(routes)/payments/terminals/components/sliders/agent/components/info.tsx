import react, { useState } from 'react';
import { Switch } from '@headlessui/react';
import Input from '@potta/components/input';
import Select from '@potta/components/select';

const Info = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div>
      <div className="w-full">
        <Input
          type="number"
          label="Telephone Number *"
          name={''}
          placeholder="+23"
        />
      </div>
      <div className="mt-5 bg-[#DDE6E2]">
        <div className="w-full grid grid-cols-4 gap-2 py-5 p-4">
          <div className="">
            <Input type="number" name={''} placeholder="+23" />
          </div>
          <div className="">
            <Input type="number" name={''} placeholder="+23" />
          </div>
          <div className="mt-2 bg-white">
            <Select
              options={[{ label: 'Number', value: 'Number' }]}
              selectedValue={'Number'}
              onChange={() => {}}
              bg={'white'}
            />
          </div>
          <div className="flex space-x-2 ml-2 mt-4">
            <p>Required</p>
            <Switch
              checked={enabled}
              onChange={setEnabled}
              className="group relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out   data-[checked]:bg-indigo-600"
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className="pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
