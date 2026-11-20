import { ArrowUp } from 'lucide-react';
import React, { FC, useState } from 'react';
import { DateRangePicker, DateRangeValue } from '@potta/components/ui/date-picker';
import { Tabs } from '../../../_shared/states';

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

type Period = 'yesterday' | 'today' | 'this_week' | 'this_month' | 'custom';

const periods: { id: Period; label: string }[] = [
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const VouchersBox: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('yesterday');
  // The voucher list/stats API has no date-range filter yet; the range is kept in state only.
  const [range, setRange] = useState<DateRangeValue>({});

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3">
        <Tabs tabs={periods} value={selectedPeriod} onChange={setSelectedPeriod} />
        {selectedPeriod === 'custom' && (
          <DateRangePicker
            className="w-auto min-w-[260px]"
            placeholder="Pick a date range"
            value={range}
            onChange={setRange}
          />
        )}
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {datas.map((item: data, id: number) => (
          <div key={id} className="dashboard-panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">{item.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-medium text-primary">
                <ArrowUp className="h-3.5 w-3.5" />
                {item.percent}%
              </span>
            </div>
            <p className="mt-3 text-2xl font-medium tabular-nums text-foreground">{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VouchersBox;
