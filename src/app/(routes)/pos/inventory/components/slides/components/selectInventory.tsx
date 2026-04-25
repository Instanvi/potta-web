import React from "react";

const SelectInventory = () => {
    return (
        <div className="h-[85vh] w-full flex justify-center items-center">
            <div className="w-[85%] ">
                <div className="w-full flex px-4 justify-between border py-3">
                    <p>Inventory Item</p>
                    <i className="ri-arrow-right-line text-xl"></i>
                </div>
                <div className="w-full flex px-4 mt-3 justify-between border py-3">
                    <p>Non Inventory Item</p>
                    <i className="ri-arrow-right-line text-xl"></i>
                </div>
            </div>
        </div>
    )
}
export default SelectInventory