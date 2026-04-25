import Select from '@potta/components/select';
import react from 'react'

const Policies = () => {
    return (
        <div>
            <div className='  mt-5'>
                <p className='my-4'>Select Policy</p>
                <Select options={[{ value: "Spend Policy", label: "Spend Policy" }]} selectedValue={'Spend Policy'} onChange={() => { }} bg={''} />
            </div>
        </div>

    )
}

export default Policies;