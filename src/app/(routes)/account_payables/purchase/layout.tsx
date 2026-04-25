import React from 'react'
import RootLayout from '../../layout'

function Layout({children}: {children: React.ReactNode}) {
  return (
    <RootLayout>{children}</RootLayout>
  )
}

export default Layout