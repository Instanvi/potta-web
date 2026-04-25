'use client'
import Input from '@potta/components/input'
import Select from '@potta/components/select'
import react, { useState } from 'react'
import ReceiptTable from './component/table'

const Receipt = () => {
    const [price, setPrice] = useState("")
    const [quantity, setQuantity] = useState("")
    return (
        <div className='h-screen grid grid-cols-2  w-full bg-[#F2F2F2]'>
            <div className='h-screen bg-white w-full py-5 px-10'>
                <div className='flex space-x-3'>
                    <div className="mt-3 w-full">
                        <Select options={[{ label: "USD ($) ", value: "USD ($)" }]} selectedValue={"USD ($)"} onChange={() => { setPrice("") }} bg={""} />
                    </div>
                    <div className="mt-3 w-full">
                        <Select options={[{ label: "Invoice ", value: "Invoice" }]} selectedValue={"Invoice"} onChange={() => { setQuantity("") }} bg={""} />
                    </div>
                    <div className="mt-[4px] w-full">
                        <Input type={'date'} label='' name={''} />
                    </div>
                    <div className="mt-[4px] w-full">
                        <Input type={'number'} value={15} name={''} />
                    </div>
                </div>
                <div className='flex space-x-4 w-full'>
                    <div className='w-96'>
                        <div className="mt-7 w-full">
                            <Select options={[{ label: "ABC Customer ", value: "ABC Customer" }]} selectedValue={"ABC Customer"} onChange={() => { setPrice("") }} bg={""} />
                        </div>
                    </div>
                    <div >
                        <div className='h-10 w-10 rounded-full cursor-pointer flex bg-green-500 text-white mt-8 justify-center items-center '>
                            <i className='ri-add-line text-2xl'></i>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <ReceiptTable />
                    <button className='text-white mt-5 px-4 py-1 rounded-full bg-green-500'><i className='ri-add-line'></i> Add Item</button>
                </div>
            </div>
            <div>
                {/* left side */}
            </div>
        </div>
    )
}
export default Receipt
