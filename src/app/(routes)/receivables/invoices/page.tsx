'use client'
import React, { useState, useEffect } from "react";
import RootLayout from "../../layout";
import NewInvoice from "./components/newInvoice";
// import InvoiceTable from "./table";
// import NewInvoice from "../modals/showNewInvoice";
import { ContextData } from "@potta/components/providers/DataProvider";
function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
}

export default function Invoicing(): JSX.Element {
    const [heights, setHeights] = useState<string>("");
    const [dashTopHeight, setDashTopHeight] = useState<string>("");
    const context = React.useContext(ContextData);
    useEffect(() => {
        setHeights(window.innerHeight.toString());
        setDashTopHeight(localStorage.getItem("dashTopHeight") || "");
    }, []);

    const invoices: { id: number, name: string, invoice_id: string, amount: number, currency: string, sendingDate: string, dueDate: string, status: string }[] = [
        {
            id: 1,
            name: "Invoice for UI design",
            invoice_id: "inv 001",
            amount: 14000,
            currency: "XAF",
            sendingDate: "28 May 2022",
            dueDate: "28 Dec 2022",
            status: "Paid",
        },
        {
            id: 2,
            name: "Invoice for product design",
            invoice_id: "inv 002",
            amount: 14000,
            currency: "XAF",
            sendingDate: "21 Dec 2022",
            dueDate: "30 Jan 2023",
            status: "Rejected",
        },
        {
            id: 3,
            name: "Invoice for video production",
            invoice_id: "inv 003",
            amount: 14000,
            currency: "XAF",
            sendingDate: "14 Mar 2022",
            dueDate: "28 oct 2023",
            status: "Unpaid",
        },
    ];

    return (
        <RootLayout>
            <div
                style={{ height: parseInt(heights) - parseInt(dashTopHeight) - 20 }}
                className={`${context?.layoutMode === 'sidebar' ? 'pl-16':'pl-5'} flex justify-evenly pr-5`}
            >
                <div
                    className={`justify-evenly ${invoices.length === 0 ? "flex" : "hidden"
                        } mt-20`}
                >
                    <div className="flex flex-col justify-center items-center">
                        <div className="mb-10">
                            <img
                                src="/images/no invoice.svg"
                                alt=""
                                className="w-full h-full "
                            />
                        </div>
                        <h1 className="text-5xl font-bold mb-4">Create new invoice</h1>
                        <div className="w-[300px]">
                            <p className="text-center text-gray-400 text-sm">
                                Apply today and start using our banking app after documents
                                confirmation
                            </p>
                        </div>
                        <NewInvoice />
                    </div>
                </div>
                <div
                    className={`flex-col w-full ${invoices.length === 0 ? "hidden" : "flex"
                        }`}
                >
                    <div className="grid grid-cols-1 gap-y-4 gap-x-2 py-2 w-full sm:grid-cols-3">
                        <div className="flex flex-col border  px-5 py-4">
                            <div className="flex justify-between">
                                <h1 className="text-gray-400 text-sm font-semibold">
                                    Total invoices
                                </h1>
                                <i className="ri-arrow-right-up-line text-green-400"></i>
                            </div>
                            <div className="py-4">
                                <h1 className="text-3xl font-bold">CFA 9.650,00</h1>
                            </div>
                            <div className="flex justify-between">
                                <h1 className="text-sm font-semibold">Send 142 invoices</h1>
                                <h1 className="text-sm text-green-400">+10%</h1>
                            </div>
                        </div>

                        <div className="flex flex-col border  px-5 py-4">
                            <div className="flex justify-between">
                                <h1 className="text-gray-400 text-sm font-semibold">
                                    Paid invoices
                                </h1>
                                <i className="ri-arrow-left-down-line text-red-400"></i>
                            </div>
                            <div className="py-4">
                                <h1 className="text-3xl font-bold">CFA 9.650,00</h1>
                            </div>
                            <div className="flex justify-between">
                                <h1 className="text-sm font-semibold">From 122 customers</h1>
                                <h1 className="text-sm text-red-400">-2%</h1>
                            </div>
                        </div>

                        <div className="flex flex-col border  px-5 py-4">
                            <div className="flex justify-between">
                                <h1 className="text-gray-400 text-sm font-semibold">
                                    Unpaid Invoices
                                </h1>
                                <i className="ri-arrow-right-up-line text-green-400"></i>
                            </div>
                            <div className="py-4">
                                <h1 className="text-3xl font-bold">CFA 889.650,00</h1>
                            </div>
                            <div className="flex justify-between">
                                <h1 className="text-sm font-semibold">From customers</h1>
                                <h1 className="text-sm text-green-400">+15%</h1>
                            </div>
                        </div>
                    </div>

                    {/* <InvoiceTable /> */}
                </div>
            </div>
        </RootLayout>
    );
}