import React from 'react'
import RootLayout from '../layout'

const layout = ({children}: {children: React.ReactNode}) => {
  return <RootLayout>{children}</RootLayout>;
};

export default layout;