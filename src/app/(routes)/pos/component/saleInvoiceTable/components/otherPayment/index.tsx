import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import React, { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import OrderSummary from '../orderSummary';

const OtherPayment = () => {
  const context = useContext(ContextData);
  return (
    <div className="p-8 h-full bg-white">
      <div className="mb-8">
        <h3 className="text-2xl font-medium text-gray-800 mb-2">
          Other Payment Methods
        </h3>
        <p className="text-gray-600">Select your preferred payment method</p>
      </div>

      <div className="w-full overflow-auto">
        <Accordion className="space-y-4">
          <AccordionItem className="border border-gray-200  overflow-hidden">
            <AccordionItemHeading>
              <AccordionItemButton className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <img src="/icons/mtn.svg" alt="MTN" className="w-8 h-8" />
                  <p className="font-medium text-gray-800">MTN Mobile Money</p>
                </div>
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className="p-4 bg-white">
              <p className="text-gray-600 mb-3">Dial *126# to buy your items</p>
              <input
                type="text"
                placeholder="Enter phone number"
                className="w-full border border-gray-300  px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <div className="w-full mt-3 flex justify-end">
                <button className="px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors">
                  Save
                </button>
              </div>
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem className="border border-gray-200  overflow-hidden">
            <AccordionItemHeading>
              <AccordionItemButton className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <img
                    src="/icons/om.svg"
                    alt="Orange Money"
                    className="w-8 h-8"
                  />
                  <p className="font-medium text-gray-800">Orange Money</p>
                </div>
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className="p-4 bg-white">
              <p className="text-gray-600 mb-3">
                Dial #150*62# to buy your items
              </p>
              <input
                type="text"
                placeholder="Enter phone number"
                className="w-full border border-gray-300  px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <div className="w-full mt-3 flex justify-end">
                <button className="px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors">
                  Save
                </button>
              </div>
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem className="border border-gray-200  overflow-hidden">
            <AccordionItemHeading>
              <AccordionItemButton className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <img
                      src="/icons/bitcoin.svg"
                      alt="Bitcoin"
                      className="w-6 h-6"
                    />
                    <img
                      src="/icons/tether.svg"
                      alt="Tether"
                      className="w-6 h-6"
                    />
                    <img
                      src="/icons/crypto.svg"
                      alt="Crypto"
                      className="w-6 h-6"
                    />
                  </div>
                  <p className="font-medium text-gray-800">Crypto</p>
                </div>
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className="p-4 bg-white">
              <p className="text-gray-600 mb-3">
                Select your preferred cryptocurrency
              </p>
              <input
                type="text"
                placeholder="Enter wallet address"
                className="w-full border border-gray-300  px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <div className="w-full mt-3 flex justify-end">
                <button className="px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors">
                  Save
                </button>
              </div>
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem className="border border-gray-200  overflow-hidden">
            <AccordionItemHeading>
              <AccordionItemButton className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <img
                      src="/icons/visas.svg"
                      alt="Visa"
                      className="w-8 h-8"
                    />
                    <img
                      src="/icons/master.svg"
                      alt="Mastercard"
                      className="w-8 h-8"
                    />
                  </div>
                  <p className="font-medium text-gray-800">Visa / Mastercard</p>
                </div>
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className="p-4 bg-white">
              <p className="text-gray-600 mb-3">Enter your card details</p>
              <input
                type="text"
                placeholder="Card number"
                className="w-full border border-gray-300  px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full border border-gray-300  px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="w-full border border-gray-300  px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="w-full mt-3 flex justify-end">
                <button className="px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors">
                  Save
                </button>
              </div>
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                <div className="flex ml-10 -mt-5 space-x-2">
                  <img
                    src="/icons/giftcard.svg"
                    height={30}
                    width={30}
                    alt=""
                  />
                  <p className="mt-0.5">Gift Card</p>
                </div>
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              <p>Enter your gift card promo code </p>
              <input
                type="text"
                className="border mt-1.5 outline-none pl-2 py-1 w-96"
              />
              <div className="w-96 mt-2 flex justify-end">
                <button className="border px-2 -py-1 bg-green-500 text-white ">
                  Save
                </button>
              </div>
            </AccordionItemPanel>
          </AccordionItem>
        </Accordion>
      </div>
      <OrderSummary
        subtotal={context?.orderSummary?.subtotal || 0}
        discount={context?.orderSummary?.discount || 0}
        tax={context?.orderSummary?.tax || 0}
        itemDiscounts={context?.orderSummary?.itemDiscounts || 0}
        total={context?.orderSummary?.total || 0}
        setDiscount={(newDiscount: number) => {
          if (context?.setOrderSummary) {
            context.setOrderSummary((prev) => ({
              ...prev,
              discount: newDiscount,
              total: prev.subtotal + prev.tax - newDiscount,
            }));
          }
        }}
      />
    </div>
  );
};
export default OtherPayment;
