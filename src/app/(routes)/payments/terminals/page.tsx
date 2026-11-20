'use client';
import React, { useState } from 'react';
import RootLayout from '../../layout';
import Card from './components/card';
import USSD from './components/USSD';
import Agent from './components/agent';
import Pages from './components/pages';
import SliderCard from './components/sliders/card/page';
import SliderUSSD from './components/sliders/ussd/page';
import SliderAgent from './components/sliders/agent/page';
import SliderPage from './components/sliders/page/page';

const Terminals = () => {
  const [active, setActive] = useState<string>('card');
  return (
    <RootLayout>
      <div className="w-full px-16 mt-5">
        <div className="w-full flex justify-between">
          <div className="flex px-4   bg-[#F3FBFB]">
            <div
              onClick={() => setActive('card')}
              className={`flex py-2  space-x-2 px-7 duration-500 ease-in text-gray-500 cursor-pointer ${
                active == 'card' &&
                'text-green-700 border-b-2  border-green-700'
              }`}
            >
              <img
                src={`${
                  active == 'card'
                    ? '/icons/card.svg'
                    : '/icons/card-nogreen.svg'
                }`}
                alt=""
              />
              <p>Card</p>
            </div>
            <div
              onClick={() => setActive('USSD')}
              className={`flex py-2  space-x-2 px-7 duration-500 ease-in text-gray-500 cursor-pointer ${
                active == 'USSD' &&
                'text-green-700 border-b-2  border-green-700'
              }`}
            >
              <img
                src={`${
                  active == 'USSD' ? '/icons/USSD-green.svg' : '/icons/USSD.svg'
                }`}
                alt=""
              />
              <p>USSD</p>
            </div>
            <div
              onClick={() => setActive('agent')}
              className={`flex py-2  space-x-2 px-7 duration-500 ease-in text-gray-500 cursor-pointer ${
                active == 'agent' &&
                'text-green-700 border-b-2  border-green-700'
              }`}
            >
              <img
                src={`${
                  active == 'agent'
                    ? '/icons/agent-green.svg'
                    : '/icons/agent.svg'
                }`}
                alt=""
              />
              <p>Agent</p>
            </div>
            <div
              onClick={() => setActive('pages')}
              className={`flex py-2  space-x-2 px-7 duration-500 ease-in text-gray-500 cursor-pointer ${
                active == 'pages' &&
                'text-green-700 border-b-2  border-green-700'
              }`}
            >
              <img
                src={`${
                  active == 'pages'
                    ? '/icons/pages-green.svg'
                    : '/icons/pages.svg'
                }`}
                alt=""
              />
              <p>Pages</p>
            </div>
          </div>
          <div className="duration-500 ease-in">
            {active == 'card' && <SliderCard />}
            {active == 'USSD' && <SliderUSSD />}
            {active == 'agent' && <SliderAgent />}
            {active == 'pages' && <SliderPage />}
          </div>
        </div>
        <div className="w-full duration-500 ease-in">
          <div className="duration-500 ease-in">
            {active == 'USSD' && <USSD />}
          </div>
          <div className="duration-500 ease-in">
            {active == 'agent' && <Agent />}
          </div>
          <div className="duration-500 ease-in">
            {active == 'pages' && <Pages />}
          </div>
          <div className="duration-500 ease-in">
            {active == 'card' && <Card />}
          </div>
        </div>
      </div>
    </RootLayout>
  );
};
export default Terminals;
