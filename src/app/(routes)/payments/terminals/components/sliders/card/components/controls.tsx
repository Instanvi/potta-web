import Input from '@potta/components/input';
import CustomSelect from '@potta/components/react-select';  
import Select from '@potta/components/select';
import react, { useState } from 'react'
import { SingleValue } from 'react-select';

interface Cat {
  value: string;
  label: string;
}

const category: Cat[] = [
  {
    value: 'Office Stationary',
    label: 'Office Stationary',
  },
  {
    value: 'Travel Expenses',
    label: 'Travel Expenses',
  },
];

const Control = () => {
  const [selectedCategory, setSelectedCategory] = useState<Cat[] | null | any>(
    null
  );

  const handleCategoryChange = (selected: SingleValue<Cat> | Cat[]) => {
    // If multi is true, the selected value is an array
    setSelectedCategory(selected as Cat[]);
  };
  return (
    <div>
      <div className="mt-4">
        <p className="mb-3">Restricted Vendors</p>
        <CustomSelect
          options={category}
          value={selectedCategory}
          onChange={handleCategoryChange}
          multi={true}
        />
      </div>
      <div className="w-full mt-4 grid grid-cols-2 gap-2">
        <div className=" w-full">
          <p>Max Transaction Amount</p>
          <div className="w-full flex ">
            <div className="w-[80%]">
              <Input type="number" name="" />
            </div>
            <div className="w-[20%] mt-2">
              <Select
                options={[{ value: 'XAF', label: 'XAF' }]}
                selectedValue={'XAF'}
                onChange={() => {}}
                bg={''}
              />
            </div>
          </div>
        </div>
        <div className="w-full  ">
          <Input type="date" label="Disable Date" name="" />
        </div>
      </div>
    </div>
  );
};

export default Control;
