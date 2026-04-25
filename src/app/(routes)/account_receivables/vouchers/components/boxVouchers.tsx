import { ArrowUp, CalendarIcon } from 'lucide-react';
import React, { FC, useState } from 'react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';

interface data {
  name?: string;
  percent?: number;
  price?: string;
}

const datas: data[] = [
  { name: 'Tickets', percent: 60.5, price: 'XAF 120,000' },
  { name: 'Coupons', percent: 30.5, price: 'XAF 80,000' },
  { name: 'Cashbacks', percent: 10.8, price: 'XAF 40,000' },
  { name: 'Royalty Points', percent: 53.4, price: 'XAF 20,000' },
];

const periods = ['Yesterday', 'Today', 'This week', 'This Month', 'Custom'];

const cn = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const VouchersBox: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const formatDateRange = () => {
    if (!date?.from) return '';
    if (!date?.to) return format(date.from, 'PPP');
    return `${format(date.from, 'PPP')} - ${format(date.to, 'PPP')}`;
  };

  const getCustomButtonText = () => {
    if (selectedPeriod === 'Custom' && date?.from) {
      if (!date.to) return format(date.from, 'MMM d, yyyy');
      if (
        date.from.getFullYear() === date.to.getFullYear() &&
        date.from.getMonth() === date.to.getMonth()
      ) {
        return `${format(date.from, 'MMM d')} - ${format(date.to, 'd, yyyy')}`;
      }
      return `${format(date.from, 'MMM d')} - ${format(date.to, 'MMM d, yyyy')}`;
    }
    return 'Custom';
  };

  return (
    <div className="space-y-8">
      <div className="mb-2 ml-1 flex flex-wrap gap-2">
        {periods.map((period) => {
          if (period !== 'Custom') {
            return (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-normal transition-colors',
                  selectedPeriod === period
                    ? 'bg-[#154406] text-white'
                    : 'border border-black/10 bg-white text-black hover:bg-black/[0.03]'
                )}
              >
                {period}
              </button>
            );
          }
          return (
            <Popover key={period}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    'flex items-center rounded-full px-4 py-2 text-sm font-normal transition-colors',
                    selectedPeriod === period
                      ? 'bg-[#154406] text-white'
                      : 'border border-black/10 bg-white text-black hover:bg-black/[0.03]'
                  )}
                >
                  {getCustomButtonText()}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto rounded-lg border border-black/10 bg-white p-0 shadow-lg"
                align="start"
              >
                <div className="rounded-t-lg border-b border-black/10 bg-white p-3">
                  <h3 className="text-center text-sm font-medium text-black">
                    {formatDateRange()}
                  </h3>
                </div>
                <div className="p-3">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    className="bg-white"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="rounded-md bg-[#154406] px-4 py-2 text-sm font-normal text-white"
                      onClick={() => {
                        console.log('Selected date range:', date);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {datas.map((item: data, id: number) => (
          <div
            key={id}
            className="rounded-xl border border-black/10 bg-white p-5 shadow-none"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-black">{item.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-0.5 text-xs font-normal text-[#154406]">
                <ArrowUp className="h-3.5 w-3.5" />
                {item.percent}%
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-black">
              {item.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VouchersBox;
