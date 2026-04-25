'use client';
import React, { useEffect, useState } from 'react';
import Chart from './Chart';

interface Assets {
  image: string;
  transactionName: string;
  amount: string;
}

interface Income {
  transactionName: string;
  amount: string;
}

const DashboardContent = () => {
  const [heights, setHeights] = useState<string>('');
  const [dashTopHeight, setDashTopHeight] = useState<string>('');

  useEffect(() => {
    setHeights(window.innerHeight.toString());
    setDashTopHeight(localStorage.getItem('dashTopHeight') || '');
  }, []);

  const datas: Assets[] = [
    {
      image: '/icons/user.svg',
      transactionName: 'MTN Mobile money',
      amount: '584, 451',
    },
    {
      image: '/icons/user.svg',
      transactionName: 'OM orange money',
      amount: '584, 451',
    },
    // More data...
  ];

  const Incomes: Income[] = [
    {
      transactionName: 'MTN Mobile money',
      amount: '584, 451',
    },
    {
      transactionName: 'OM Orange money',
      amount: '584, 451',
    },
    // More transactions...
  ];
  return (
    <div className="">
      <div
        style={{ height: parseInt(heights) - parseInt(dashTopHeight) - 20 }}
        className="pt-3"
      >
        <div className="flex flex-col grow h-full">
          <div className="mt-5 w-full  py-2">
            <Chart />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-4 mt-5 pb-5 grow">
            <div className="flex flex-col  border grow">
              <div className="flex border-b items-center w-full bg-[#F3FBFB] p-4">
                <h1 className="text-[18px]">Collection by Terminals</h1>
              </div>
              <div className="flex flex-col px-4 gap-2 my-4">
                {datas.map((data, index) => (
                  <div
                    key={index}
                    className="flex w-full border-b py-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <img src={data.image} className="h-10 w-10" alt="" />
                      <div className="ml-4">
                        <div className=" text-gray-900">
                          {data.transactionName}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className=" text-gray-900 flex justify-end">
                        CFA {data.amount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col  border grow">
                <div className="flex justify-between border-b items-center w-full bg-[#F3FBFB] p-4">
                  <h1 className="text-[18px]">Recent Transactions</h1>
                  <i className="ri-arrow-right-up-line"></i>
                </div>
                <div className="flex flex-col px-4 gap-2 mt-4 divide-y">
                  {Incomes.map((data, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 first:pt-0 items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div className="ml-4">
                          <div className=" text-gray-900">
                            {data.transactionName}{' '}
                          </div>
                        </div>
                      </div>
                      <div className=" text-gray-900 text-lg">
                        {data.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardContent;
