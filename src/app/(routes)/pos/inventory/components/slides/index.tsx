'use client'
import Slider from "@potta/components/slideover";
import React, { useState } from "react";
import SelectInventory from "./components/selectInventory";
import CreateProduct from "./components/create_product/inventory";


const SlideOverInventory = () => {
    const [data_to_show, setData_to_show] = useState("")
    return (
        <Slider edit={false} buttonText="add new product" title={"Add New Product"}>
            <div className="w-full">
                {/* <SelectInventory /> */}
                <CreateProduct />
            </div>
        </Slider>
    )
}
export default SlideOverInventory
