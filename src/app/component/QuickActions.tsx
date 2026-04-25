import React from 'react';
import { mostUsedApps } from './data';

interface QuickActionItemProps {
  item: typeof mostUsedApps[0];
}

const QuickActionItem = ({ item }: QuickActionItemProps) => {
  const AppIcon = item.icon;
  return (
    <a
      href={`/${item.value}`}
      className="group rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
    >
      <div className="flex items-center gap-3 rounded-lg border border-stone-200/80 bg-stone-50/60 px-4 py-3 transition-all duration-200 hover:border-green-200/90 hover:bg-white hover:shadow-[0_1px_3px_rgba(21,128,61,0.08)] group-active:scale-[0.99]">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200/70 bg-white transition-colors group-hover:border-green-200/80">
          <AppIcon className="h-5 w-5 text-black transition-colors group-hover:text-black" />
        </div>
        <span className="whitespace-nowrap text-base font-normal text-black">
          {item.label}
        </span>
      </div>
    </a>
  );
};

export const QuickActions = () => (
  <div className="flex flex-col gap-3">
    <h2 className="m-0 px-1 text-base font-medium uppercase tracking-wide text-black">
      Quick Access
    </h2>
    <div className="flex flex-wrap gap-2">
      {mostUsedApps.map((item) => (
        <QuickActionItem key={item.value} item={item} />
      ))}
    </div>
  </div>
);
