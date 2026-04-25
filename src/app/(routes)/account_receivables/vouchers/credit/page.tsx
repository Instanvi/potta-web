'use client';
import Box from './components/box';
import InvoiceTableComponents from './components/table';

import Link from 'next/link';
import SliderInvoice from './components/slideNewInvoice';
import Search from '@potta/components/search';
import Button from '@potta/components/button';
import { useState } from 'react';
import ModalInvoice from '@potta/app/(routes)/account_receivables/credit/components/modal';
import useGetAllInvoice from '@potta/app/(routes)/account_receivables/credit/_hooks/useGetAllInvoice';
import CustomSelect, { IOption } from './components/CustomSelect';
const Invoice = () => {
  const [detailsModal, setDetailsModal] = useState<boolean>(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetAllInvoice({
    limit: 10,
    page,
  });

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const options: IOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  if (isError) {
    return (
      <div className={'w-full py-24 flex flex-col items-center justify-center'}>
        An Error Occured
        <button>Refresh</button>
      </div>
    );
  }
  return (
    <div className="pt-10 px-14">
      <Box />
      <div className="flex justify-between w-full">
        <div className="mt-5 w-[50%] flex items-center space-x-2">
          <div className="w-[65%]">
            <Search />
          </div>

          <CustomSelect
            options={options}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Choose an option"
          />
          <CustomSelect
            options={options}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Choose an option"
          />
        </div>
        <div className="w-[50%] flex justify-end">
          <div className="flex mt-10 space-x-2">
            <div>
              {/*<Link href={'/invoicing/new_invoice'}>*/}
              <Button
                text={'Export'}
                icon={<i className="ri-upload-2-line"></i>}
                theme="lightBlue"
                type={'button'}
                color={true}
              />
              {/*</Link>*/}
            </div>
            <div>
              <Link href={'/invoicing/new_invoice'}>
                <Button
                  text={'Create Invoice'}
                  icon={<i className="ri-file-add-line"></i>}
                  theme="default"
                  type={'button'}
                />
              </Link>
            </div>
            <div>
              <SliderInvoice />
            </div>
          </div>
        </div>
      </div>
      {detailsModal ? (
        <ModalInvoice
          open={detailsModal}
          setOpen={(bool) => setDetailsModal(bool)}
        />
      ) : null}

      {/* <CustomInput />
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Choose an option"
      /> */}
      <div className="mt-5">
        <InvoiceTableComponents
          isInvoiceDetailsOpen={detailsModal}
          onInvoiceDetailsClose={() => {
            setDetailsModal(false);
          }}
          onInvoiceDetailsOpen={() => setDetailsModal(true)}
          onDeleteModal={() => {}}
        />
      </div>
    </div>
  );
};

export default Invoice;
