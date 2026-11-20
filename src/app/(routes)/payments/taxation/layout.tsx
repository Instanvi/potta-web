'use client'
import React, { FC, ReactNode } from "react";
import RootLayout from "../../layout";

interface Props {
    children: ReactNode
}

const TaxationLayout: FC<Props> = ({ children }) => {
    return (
        <RootLayout  >
            {children}
        </RootLayout>
    )
}
export default TaxationLayout;