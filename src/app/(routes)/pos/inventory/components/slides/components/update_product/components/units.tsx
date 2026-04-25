import Input from '@potta/components/input'
import Select from '@potta/components/select'
import React, { useState } from 'react'


interface UnitProps {
    unit: string;
}
const Unit: React.FC<UnitProps> = () => {
  const [unit, setunit] = useState()
    return (
        <div className=' mt-6  w-full'>
            <div className="mt-2">
                <p className="mb-2">Select&nbsp;Unit&nbsp;Type</p>
                <Select options={[{ label: "Single Unit ", value: "Single Unit" }]} selectedValue={"Single Unit"} onChange={() => { }} bg={""} />
            </div>
            {/* <div className="mt-8">
                <p className="mb-2">Select&nbsp;Base&nbsp;Type</p>
                <Select options={[{ label: "Kilogram (KG) ", value: "Kilogram (KG)" }]} selectedValue={"Kilogram (KG)"} onChange={() => { }} bg={""} />
            </div> */}
        </div>
    )
}

export default Unit
