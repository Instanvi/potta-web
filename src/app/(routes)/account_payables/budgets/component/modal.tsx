'use client';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import Input from '@potta/components/input';
import Modal from '@potta/components/modal';
import Select from '@potta/components/select';
import React, { FC, useState, useContext, Fragment, ContextType } from 'react';

const NewBudget: FC = () => {
  const context = useContext(ContextData);
  const [open, setOpen] = useState<boolean>(false);

  const [newBudget, setNewBudget] = useState<{
    budget_name: string;
    budget_goal: string;
    currency: string;
    budget_recurrence: string;
  }>({
    budget_name: '',
    budget_goal: '',
    currency: 'XAF',
    budget_recurrence: 'One time',
  });
  if (!context) {
    return <div>Error: Context not available</div>;
  }
  // Check if context is null

  const HandleNewBudgetChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewBudget((prevNewBudget) => ({
      ...prevNewBudget,
      [name]: value,
    }));
  };

  const CreateNewBudget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newId =
      context.payouts.length > 0
        ? context.payouts[context.payouts.length - 1].id + 1
        : 1;
    const newBudgetData = {
      id: newId,
      budget_name: newBudget.budget_name,
      budget_goal: newBudget.budget_goal,
      currency: newBudget.currency,
      amount_spent: 0,
      amount_allocated: 0,
      amount_available: 0,
    };

    context.setPayouts((current: any) => [...current, newBudgetData]);
    setOpen(false);
    console.log('newBudget', newBudget);
  };

  return (
    <Modal
      icon={<i className="ri-add-line"></i>}
      title="New Budget"
      text="Add New Budget"
    >
      <div className="bg-white transform overflow-hidden rounded-md py-4">
        <div className="flex flex-col  px-4 border-b"></div>

        <form action="" onSubmit={CreateNewBudget}>
          <div className="flex flex-col mt-6 px-8">
            <div className="w-full mb-3">
              <p className="mb-2 text-gray-900 font-medium">Budget Name</p>
              <Input
                type={'text'}
                name={'budget_name'}
                onchange={HandleNewBudgetChange}
                value={newBudget.budget_name}
              />
            </div>

            <div className="w-full mb-3">
              <span className="mb-3 text-gray-900 font-medium">
                Budget Goal
              </span>
              <div className="flex w-full  rounded-md divide-x">
                <div className="w-[90%]">
                  <Input
                    type={'number'}
                    name={'budget_goal'}
                    onchange={HandleNewBudgetChange}
                    value={newBudget.budget_goal}
                  />
                </div>
                <div className="mt-2">
                  <Select
                    options={[{ value: 'XAF', label: 'XAF' }]}
                    border
                    selectedValue={'XAF'}
                    onChange={() => {}}
                    bg={'border'}
                  />
                </div>
              </div>
            </div>

            <div className="w-full mb-3">
              <p className="mb-3 text-gray-900 font-medium">
                Budget Recurrence
              </p>
              <Select
                options={[{ value: 'One time', label: 'One time' }]}
                border={false}
                selectedValue={'One time'}
                onChange={() => {}}
                bg={'border'}
              />
            </div>
          </div>

          <div className="flex justify-end mt-8 border-t pt-4 px-8">
            <Button type={'submit'} text="Next" />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NewBudget;
