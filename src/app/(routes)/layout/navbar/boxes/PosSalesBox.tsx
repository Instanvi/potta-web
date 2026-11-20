import { ArrowUp, CalendarIcon } from 'lucide-react';
import React, { FC, useState } from 'react';
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@potta/components/shadcn/popover";
import { Calendar } from "@potta/components/shadcn/calendar";

interface data {
    name?: string,
    percent?: number,
    price?: string,
}

const datas: data[] = [
    {
        name: "Gross Sales",
        percent: 60.5,
        price: "XAF 120,000",
    },
    {
        name: "Pending ",
        percent: 30.5,
        price: "XAF 80,000",
    },
    {
        name: "Cash",
        percent: 10.8,
        price: "XAF 40,000",
    },
    {
        name: "Royalty Points",
        percent: 53.4,
        price: "XAF 20,000",
    },
]

const periods = ['Yesterday', 'Today', 'This week', 'This Month', 'Custom'];

// Helper function to conditionally join classNames
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

const PosSalesBox: FC<data> = () => {
    const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 7),
    });

    // Format the date range for display
    const formatDateRange = () => {
        if (!date?.from) return "";
        if (!date?.to) return format(date.from, "PPP");
        return `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;
    };

    // Display the selected date range on the Custom button when it's selected
    const getCustomButtonText = () => {
        if (selectedPeriod === 'Custom' && date?.from) {
            // Show abbreviated date format on the button
            if (!date.to) return format(date.from, "MMM d, yyyy");
            if (date.from.getFullYear() === date.to.getFullYear() &&
                date.from.getMonth() === date.to.getMonth()) {
                // Same month and year
                return `${format(date.from, "MMM d")} - ${format(date.to, "d, yyyy")}`;
            }
            return `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`;
        }
        return "Custom";
    };

    return (
        <div className='space-y-14'>
            <div className="flex gap-2 mb-6 ml-3">
                {periods.map((period) => {
                    if (period !== 'Custom') {
                        return (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-4 py-2 flex rounded-full items-center text-sm font-medium transition-colors ${
                                    selectedPeriod === period
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {period}
                            </button>
                        );
                    } else {
                        return (
                            <Popover key={period}>
                                <PopoverTrigger>
                                    <button
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-4 py-2 flex rounded-full items-center text-sm font-medium transition-colors ${
                                            selectedPeriod === period
                                                ? 'bg-blue-900 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {getCustomButtonText()}
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent 
                                    className="w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-md"
                                    align="start"
                                >
                                    {/* Date range header */}
                                    <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-md">
                                        <h3 className="font-medium text-center">
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
                                        <div className="flex justify-end mt-4">
                                            <button 
                                                className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm"
                                                onClick={() => {
                                                    // Handle applying the date range
                                                    console.log("Selected date range:", date);
                                                }}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        );
                    }
                })}
            </div>
            <div className='grid grid-cols-4 w-[95%]'>
                {datas.map((item: data, id: number) => {
                    return (
                        <div key={id} className='w-fit h-36 p-5'>
                            <div className='flex gap-1'>
                                <div>
                                    <p className='font-medium text-xl'>{item.name}</p>
                                </div>
                                <div>
                                    <button className='text-md font-medium rounded-full px-2 py-0.5 flex items-center bg-green-50 text-green-600'>
                                        <ArrowUp className='h-4 w-4 ' />
                                        <p>{item.percent}%</p>
                                    </button>
                                </div>
                            </div>
                            <div className='h-1 w-full mt-5 text-4xl'>{item.price}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default PosSalesBox;