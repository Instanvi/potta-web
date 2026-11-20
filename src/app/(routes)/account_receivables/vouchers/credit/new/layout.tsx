'use client'
import React, { FC, ReactNode } from "react";

interface Props {
    children: ReactNode
}

const InvoiceLayout: FC<Props> = ({ children }) => {
    return (
        <div className="w-full  overflow-hidden">
            <div className="w-full ">
                <div className="  w-full overflow-hidden  relative  p-0 ">
                    {children}
                </div>
            </div>
        </div>
    )
}
export default InvoiceLayout;
