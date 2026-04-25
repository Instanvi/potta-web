import react from 'react'
import TableComponents from './components/table'
import RootLayout from '../../layout'
import Period from './components/period'
import Status from './components/status'
import Method from './components/method'

const PaymentTablePage = () => {

    return (
        <RootLayout>
            <div className='w-full px-10 flex'>
                <div className='w-[75%] mt-7 px-4'>
                    <TableComponents />
                </div>
                <div className='w-[25%] space-y-3 pl-5 border-l  pt-10'>
                    <div>
                        <Period />
                    </div>
                    <div>
                        <Status />
                    </div>
                    <div>
                        <Method />
                    </div>
                </div>
            </div>

        </RootLayout>
    )
}
export default PaymentTablePage 