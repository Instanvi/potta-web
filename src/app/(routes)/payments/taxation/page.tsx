import React from "react";
import TaxationLayout from "./layout";

const Taxation = () => {
    return (
        <>

            <div className="h-[80vh] w-full px-4 flex justify-center items-center">

                <div className="" >
                    <div className="text-center font-normal text-3xl mb-10">
                        <h3>What would you like</h3>
                        <h3>to file for today?</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-5">
                        <div className="w-28 flex cursor-pointer justify-center h-auto p-7 bg-[#F3FBFB]">
                            <img src="/icons/tax.svg" alt="" />
                        </div>
                        <div className="w-28 flex cursor-pointer justify-center h-auto p-7 bg-[#F3FBFB]">
                            <img src="/icons/municipal.svg" alt="" />
                        </div>
                        <div className="w-28 flex cursor-pointer justify-center h-auto p-7 bg-[#F3FBFB]">
                            <img src="/icons/license.svg" alt="" />
                        </div>
                        <div className="w-28 flex cursor-pointer justify-center h-auto p-7 bg-[#F3FBFB]">
                            <img src="/icons/penalities.svg" alt="" />
                        </div>
                    </div>
                </div>
            </div>

        </>

    )
}

export default Taxation;