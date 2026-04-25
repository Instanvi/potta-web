import React from 'react'
import { useForm } from 'react-hook-form'

const CustomInput = () => {

    const {register, } = useForm({

    })
  return (
    <div>
        <div className='flex items-center border '>
            <p>
                First name
            </p>
        <input />
        </div>
    </div>
  )
}

export default CustomInput