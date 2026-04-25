import React from 'react'

const Pages = () => {
    return (
        <div>
            <table className='w-full mt-5'>
                <tr className='border py-2'>
                    <td className='flex py-2 px-2 space-x-3'>
                        <img src="/icons/pages-green.svg" alt="" />
                        <div>
                            <p className='font-medium'>Back To School</p>
                            <p className='font-normal text-gray-500'>Card Number</p>
                        </div>
                    </td>
                    <td>
                        <div>
                            <p className='font-normal '>Spend , Collect</p>
                        </div>
                    </td>
                    <td>
                        <div>
                            <p className='font-medium'>XAF 350,000 </p>
                            <p className='font-normal text-gray-500'>Collected</p>
                        </div>
                    </td>
                    <td>
                        <div>
                            <p className='font-medium'>XAF 350,000 </p>
                            <p className='font-normal text-gray-500'>Distributed</p>
                        </div>
                    </td>
                    <td>
                        <div className='flex  justify-between '>
                            <div>
                                <button className='px-4 py-1 text-green-500 bg-green-50'>Active</button>
                            </div>
                            <div className='-ml-5 pr-5'>
                                <p className='font-normal text-gray-900'><i className='ri-more-line text-2xl'></i></p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    )
}
export default Pages 