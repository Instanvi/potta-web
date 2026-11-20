import React from 'react';

const data = [
    {
        id: 1,
        title: 'Complete filling',
        amount: '26',
        color: '#34C759',
        percentage: '37.9',
    },
    {
        id: 2,
        title: 'Pending',
        amount: '02',
        color: '#FF9500',
        percentage: '34.1',
    },
    {
        id: 3,
        title: 'Missed Fillings',
        amount: '17',
        color: '#FF0000',
        percentage: '24',
    },
    {
        id: 4,
        title: 'Deductions',
        amount: '5000 XAF',
        color: '#007AFF',
        percentage: '16.8',
    },
];

const Boxes = () => {
    return (
        <div className="grid grid-cols-4 gap-5">
            {data.map((item) => (
                <div key={item.id} className="border p-5">
                    <div className="flex w-full justify-between">
                        <p style={{ color: item.color }}>{item.title}</p>
                        <button className="text-white py-0 px-1.5 rounded-full text-[10px] bg-green-400">
                            {item.percentage} %
                        </button>
                    </div>

                    <div className="mb-8 mt-5 text-center text-3xl">{item.amount}</div>
                </div>
            ))}
        </div>
    );
};

export default Boxes;
