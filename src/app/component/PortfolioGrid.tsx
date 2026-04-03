import React from 'react';
import { gridItems } from './data';

export const PortfolioGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {gridItems.map((item) => {
      const IconComponent = item.icon;
      return (
        <a
          href={`/${item.value}`}
          key={item.value}
          className="group block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 rounded-md"
        >
          <div className="bg-white border border-slate-200 p-5 flex flex-col items-center text-center h-full cursor-pointer hover:bg-slate-50 transition-colors duration-150 rounded-md">
            <IconComponent className="w-8 h-8 text-slate-700 mb-3 group-hover:text-green-600 transition-colors" />
            <div className="text-sm font-medium text-slate-800 group-hover:text-green-600 transition-colors">
              {item.label}
            </div>
          </div>
        </a>
      );
    })}
  </div>
);
