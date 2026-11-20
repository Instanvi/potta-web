'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { FC, ReactNode, useState } from "react";
import { Toaster } from "react-hot-toast";

interface Props {
    children: ReactNode
}

const POSFilesLayout: FC<Props> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
    return (
      <QueryClientProvider client={queryClient}>
         <Toaster
        position="top-center"
        toastOptions={{
          className: '',
        }}
      />
        <div className="w-full h-screen overflow-hidden">

            <div className="w-full h-screen">
                <div className="h-[100vh] w-full overflow-hidden  relative  p-0 ">
                    {children}
                </div>
            </div>

        </div>
        </QueryClientProvider>
    )
}
export default POSFilesLayout;
