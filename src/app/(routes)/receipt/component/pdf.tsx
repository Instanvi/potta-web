import React from "react";

const PdfView = () => {
    return (
        <div className="w-full ">
            <div className="h-16 bg-green-600 w-full">
            </div>
            <div className="p-5">
                <h3>Invoice</h3>
                <div className="p-5">
                    <p className="text-xl">Invoice</p>
                    <div className="w-full grid grid-cols-2 gap-2">
                        <div className="flex">
                            <div>
                                <p className="text-xl">From : </p>
                            </div>
                            <div>
                                <p></p>
                            </div>
                        </div>
                        <div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PdfView