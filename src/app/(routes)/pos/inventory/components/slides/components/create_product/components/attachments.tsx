

import MyDropzone from '@potta/components/dropzone'
import React from 'react'

const Attachments = () => {
    return (
        <div className='flex mt-4 space-x-3 w-full'>
            <div className='w-full'>
                <label htmlFor="">Image</label>
                <MyDropzone />
            </div>
        </div>
    )
}

export default Attachments
