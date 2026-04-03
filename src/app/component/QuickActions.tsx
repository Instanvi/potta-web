import React from 'react';
import { mostUsedApps } from './data';

export const QuickActions = () => (
  <div className="flex flex-col gap-3">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
      Quick Access
    </span>
    <div className="flex flex-wrap gap-2">
      {mostUsedApps.map((item) => {
        const AppIcon = item.icon;
        return (
          <a
            href={`/${item.value}`}
            key={item.value}
            className="group rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            <div className="bg-slate-50/50 border border-slate-200/60 px-4 py-2.5 flex items-center gap-3 hover:bg-white hover:border-green-200 hover:shadow-sm transition-all duration-200 rounded-lg group-active:scale-95">
              <div className="w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:border-green-100 transition-colors">
                <AppIcon className="w-4 h-4 text-slate-500 group-hover:text-green-600 transition-colors" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  </div>
);
