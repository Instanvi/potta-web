import react, { FC } from 'react'

interface data {
    name?: string,
    percent?: number,
    price?: string,
}

const datas: data[] = [
    {
        name: "Paid",
        percent: 60.5,
        price: "XAF 120,000",
    },
    {
        name: "Pending Approval",
        percent: 30.5,
        price: "XAF 80,000",
    },
    {
        name: "Accepted",
        percent: 10.8,
        price: "XAF 40,000",
    },
    {
        name: "Outstanding",
        percent: 53.4,
        price: "XAF 20,000",
    },

]
const Box: FC<data> = () => {
    return (
        <div className='grid grid-cols-4 gap-4'>
            {datas.map((item: data, id: number) => {
                return (
                    <div key={id} className='border w-full h-36 p-5'>
                        <div className='flex justify-between'>
                            <div>
                                <p>{item.name}</p>
                            </div>
                            <div>
                                <button className='text-sm rounded-full px-2 py-0.5 text-xs text-white bg-green-500'><p>{item.percent} %</p></button>
                            </div>
                        </div>
                        <div className='h-1 w-full text-center mt-5 text-2xl'>{item.price}</div>
                    </div>
                )
            })}
        </div>
    )

}
export default Box