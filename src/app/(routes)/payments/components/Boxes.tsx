import React from 'react';

const paymentData = [
  {
    id: 1,
    title: 'Paid',
    amount: 'XAF 28000',
    color: 'text-green-600',
    percent: '+37.8%',
    percentColor: 'bg-green-100 text-green-700',
  },
  {
    id: 2,
    title: 'Pending',
    amount: 'XAF 28000',
    color: 'text-orange-500',
    percent: '+37.8%',
    percentColor: 'bg-green-100 text-green-700',
  },
  {
    id: 3,
    title: 'Cancelled',
    amount: 'XAF 28000',
    color: 'text-red-600',
    percent: '+37.8%',
    percentColor: 'bg-green-100 text-green-700',
  },
];

function Boxes() {
  return (
    <div className="grid grid-cols-3 gap-5 mt-5">
      {paymentData.map((item) => (
        <div key={item.id} className="border p-6 bg-white">
          <div className="flex w-full justify-between items-center mb-2">
            <p className={`font-medium text-lg ${item.color}`}>
              {item.title}
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-full ${item.percentColor}`}
            >
              {item.percent}
            </span>
          </div>
          <div className="mb-2 mt-5 text-3xl font-medium text-black text-center">
            {item.amount}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Boxes;
