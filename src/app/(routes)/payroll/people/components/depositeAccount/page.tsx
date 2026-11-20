'use client'
import React, { useState } from "react";
import BankAccount from "./bankaccount";
import Wallets from "./wallet";

const DepositeAccount = () => {
    const [active, setActive] = useState<string>("Bank")
    return (
        <>
            <div className='w-full px-16 mt-8'>
                <div className='w-full flex justify-between'>
                    <div className='flex px-4   bg-[#F3FBFB]'>
                        <div onClick={() => setActive('Bank')} className={`flex py-2  space-x-2 px-7 duration-500 ease-in text-gray-500 cursor-pointer ${active == 'Bank' && 'text-green-700 border-b-2  border-green-700'}`}>
                            <p>Bank Account</p>
                        </div>
                        <div onClick={() => setActive('Wallets')} className={`flex py-2  space-x-2 px-7 duration-500 ease-in text-gray-500 cursor-pointer ${active == 'Wallets' && 'text-green-700 border-b-2  border-green-700'}`}>
                            <p>Wallets</p>
                        </div>
                    </div>

                </div>
                <div className='w-full mt-10 duration-500 ease-in'>
                    <div className='duration-500 ease-in'>{active == "Bank" && <BankAccount />}</div>
                    <div className='duration-500 ease-in'>{active == "Wallets" && <Wallets />}</div>
                </div>
            </div>
        </>
    )
}

export default DepositeAccount