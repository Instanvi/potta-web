import React from 'react';
import { gridItems } from './data';
import { GridItem } from './types';

interface PortfolioItemProps {
  item: GridItem;
}

const PortfolioItem = ({ item }: PortfolioItemProps) => {
  const IconComponent = item.icon;
  return (
    <a
      href={`/${item.value}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 rounded-md"
    >
      <div className="flex h-full cursor-pointer flex-col items-center rounded-md border border-stone-200/90 bg-white p-5 text-center shadow-[0_1px_3px_rgba(21,128,61,0.05)] transition-colors duration-150 hover:border-green-200/80 hover:bg-stone-50">
        <IconComponent className="mb-3 h-9 w-9 text-black transition-colors group-hover:text-black" />
        <div className="text-base font-normal text-black">
          {item.label}
        </div>
      </div>
    </a>
  );
};

export const PortfolioGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {gridItems.map((item) => (
      <PortfolioItem key={item.value} item={item} />
    ))}
  </div>
);
