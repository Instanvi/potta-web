import RootLayout from '../../layout'
import TableComponents from './components/table'
import Period from './components/period'
import Type from './components/type'
import Method from './components/method'
import Boxes from './components/boxes'


const PaymentTablePage = () => {

    return (
        <RootLayout>
            <div className='px-10 my-5'>
                <Boxes />
            </div>
            <hr />
            <div className='w-full   px-10 flex'>
                <div className='w-[75%] -7 px-4'>
                    <TableComponents />
                </div>
                <div className='w-[25%] space-y-3 pl-5 border-l  pt-10'>
                    <div>
                        <Period />
                    </div>
                    <div>
                        <Type />
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