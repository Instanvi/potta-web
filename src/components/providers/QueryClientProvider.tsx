
"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, ReactNode, useState } from 'react'

interface ITanstackQueryClientProvider {
    children : ReactNode
}
const TanstackQueryClientProvider:FC<ITanstackQueryClientProvider> = ({children}) => {
    const [queryClient] = useState(()=> new QueryClient({
        defaultOptions:{
            queries:{
                staleTime:60 * 1000
            }
        }
    }) )
  return <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
}

export default TanstackQueryClientProvider