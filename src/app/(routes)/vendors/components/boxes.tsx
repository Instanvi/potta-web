import React from 'react';

const data = [
    {
        id: 1,
        title: 'Complete filling',
        amount: '2600 XAF',
        total: "04",
        color: '#34C759',
        percentage: '37.9',
    },
    {
        id: 2,
        title: 'Pending',
        amount: '25000 XAF',
        total: "04",
        color: '#FF9500',
        percentage: '34.1',
    },


];

const Boxes = () => {
    return (
        <div className="grid grid-cols-5 gap-5">
            {data.map((item) => (
                <div key={item.id} className="border p-5">
                    <div className="flex w-full justify-between">
                        <p className='text-black text-lg'>{item.title}</p>
                    </div>
                    <div className="mb-8 mt-5 text-center text-3xl">{item.amount}</div>
                    <p className='text-gray-400 text-xs'>from {item.total} Customers</p>
                </div>
            ))}
        </div>
    );
};

export default Boxes;
