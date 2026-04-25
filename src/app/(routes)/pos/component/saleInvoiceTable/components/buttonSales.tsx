import Button from '@potta/components/button';
import React, { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';

const SaleInvoiceButons = () => {
  const context = useContext(ContextData);

  return (
    <div className="w-full py-1 grid grid-cols-4 gap-1">
      <div className="flex flex-col space-y-3">
        <Button
          onClick={() => {
            context?.setItemSelected('cart');
          }}
          width="full"
          theme={context?.itemSelected == 'cart' ? 'lightGreen' : 'white'}
          color={context?.itemSelected == 'cart' ? false : true}
          text={'cart'}
          type={'submit'}
          icon={<i className="ri-shopping-cart-line text-2xl mr-2"></i>}
        />
      </div>
      <div className="flex flex-col space-y-3">
        <Button
          onClick={() => {
            context?.setItemSelected('cash');
          }}
          width="full"
          theme={context?.itemSelected == 'cash' ? 'lightGreen' : 'white'}
          color={context?.itemSelected == 'cash' ? false : true}
          text={'PayCash'}
          icon={<i className="ri-money-euro-box-line text-2xl mr-2"></i>}
          type={'submit'}
        />
      </div>
      <div className="flex flex-col space-y-3">
        <Button
          onClick={() => {
            context?.setItemSelected('other');
          }}
          width="full"
          theme={context?.itemSelected == 'other' ? 'lightGreen' : 'white'}
          color={context?.itemSelected == 'other' ? false : true}
          text={'OtherMethod'}
          icon={<i className="ri-wallet-2-line text-2xl mr-2"></i>}
          type={'submit'}
        />
      </div>
      <div className="flex flex-col space-y-3">
        <Button
          onClick={() => {
            context?.setItemSelected('calculate');
          }}
          width="full"
          theme={context?.itemSelected == 'calculate' ? 'lightGreen' : 'white'}
          color={context?.itemSelected == 'calculate' ? false : true}
          text={'Calculate'}
          icon={<i className="ri-calculator-line text-2xl mr-2"></i>}
          type={'submit'}
        />
      </div>
    </div>
  );
};
export default SaleInvoiceButons;
