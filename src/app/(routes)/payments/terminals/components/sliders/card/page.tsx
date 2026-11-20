"use client"
import React, { useState } from 'react';
import Input from '@potta/components/input';
import CustomSelect from '@potta/components/react-select';
import Slider from '@potta/components/slideover';
import { SingleValue } from 'react-select';
import Select from '@potta/components/select';
import Control from './components/controls';
import Policies from './components/policies';
import Button from '@potta/components/button';

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

const SliderCard = () => {
    const [selectedCategory, setSelectedCategory] = useState<Cat[] | null | any>(null);
    const [tabs, setTabs] = useState<string>('control')

    const handleCategoryChange = (selected: SingleValue<Cat> | Cat[]) => {
        // If multi is true, the selected value is an array
        setSelectedCategory(selected as Cat[]);
    };

    return (
        <Slider edit={false} title={'New Card'} buttonText="card">
            <div className='relative h-[97%] w-full'>
                <div className="mt-2">
                    <Input type="text" label="Card Holder Name" name="" />
                </div>
                <div className="mt-6">
                    <Input type="number" label="Budget" name="" />
                </div>
                <div className="mt-6">
                    <p className='mb-3'>Expense Category</p>
                    <CustomSelect
                        options={category}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        multi={true}
                    />
                </div>
                <div className='w-full mt-7 grid grid-cols-2 gap-2'>
                    <div className=' w-full'>
                        <p>Speed Limite</p>
                        <div className='w-full flex '>
                            <div className='w-[80%]'>
                                <Input type="number" name="" />
                            </div>
                            <div className='w-[20%] mt-2'>
                                <Select options={[{ value: "XAF", label: "XAF" }]} selectedValue={'XAF'} onChange={() => { }} bg={''} />
                            </div>
                        </div>
                    </div>
                    <div className='w-full  '>
                        <p className='mb-2.5'>Frequency</p>
                        <Select options={[{ value: "Monthly", label: "Monthly" }]} selectedValue={'Monthly'} onChange={() => { }} bg={''} />
                    </div>
                </div>

                <div className='flex w-fit bg-green-100  mt-7'>
                    <div onClick={() => setTabs('control')} className={`px-4 py-2.5 duration-500 ease-out ease-in ${tabs == 'control' && 'border-b  border-green-500 text-green-500 font-normal '} cursor-pointer `}>
                        <p>Controls</p>
                    </div>
                    <div onClick={() => setTabs('policies')} className={`px-4 py-2.5 duration-500 ease-out ease-in ${tabs == 'policies' && 'border-b border-green-500 text-green-500 font-normal '} cursor-pointer `}>
                        <p>Policies</p>
                    </div>
                </div>
                <div className='mt-5 duration-500 ease-in ease-out'>
                    {tabs == "control" && <Control />}
                    {tabs == "policies" && <Policies />}
                </div>

                <div className='absolute bottom-0 right-0 m-5'>
                    <Button text={'Create Card'} type={'button'} />
                </div>

            </div>
        </Slider>
    );
};

export default SliderCard;
