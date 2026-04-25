import react from 'react'

const data = [
    {
        id: "1",
        title: "Inventory History",
        desc: "Provides an evaluation of the total value of inventory based on current stock level and uit cost",
        selected: false
    },
    {
        id: "1",
        title: "Inventory History",
        desc: "Provides an evaluation of the total value of inventory based on current stock level and uit cost",
        selected: false
    },
    {
        id: "1",
        title: "Inventory History",
        desc: "Provides an evaluation of the total value of inventory based on current stock level and uit cost",
        selected: false
    },
    {
        id: "1",
        title: "Inventory History",
        desc: "Provides an evaluation of the total value of inventory based on current stock level and uit cost",
        selected: false
    },
]
const Frequent = () => {
    return (
        <>
            <div className='w-full grid-cols-3 grid gap-3'>
                {
                    data.map((items) => {
                        return (
                            <div key={items.id} className={`border w-full p-5 `}>
                                <div className='flex justify-between'>
                                    <h3 className='font-medium'>{items.title}</h3>
                                    {items.selected ? <i className="ri-star-fill border text-white"></i> : <i className="ri-star-fill text-yellow-500"></i>}
                                </div>
                                <p className='mt-2 text-gray-500 mt-2'>{items.desc}</p>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Frequent