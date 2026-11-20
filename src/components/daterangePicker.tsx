import React, { useContext } from "react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { ContextData } from "./providers/DataProvider";

export default function DateRangePickerComponent() {
    const context = useContext(ContextData);

    const handleDateRangeValueChange = (newDateRangeValue: DateValueType) => {
        // Log the new value
        console.log("newValue:", newDateRangeValue);

        // Check for null values and set only if valid
        if (newDateRangeValue && context?.setDateRangeValue) {
            context.setDateRangeValue(newDateRangeValue);
        }
    };

    // Define a default value for the date range
    const defaultDateRange: DateValueType = { startDate: null, endDate: null };

    return (
        <div className="">
            <Datepicker
                showFooter={true}
                showShortcuts={true}
                configs={{
                    shortcuts: {
                        today: "Today",
                        yesterday: "Yesterday",
                        past: (period) => `Last ${period} Days`,
                        currentMonth: "This Month",
                        pastMonth: "Last Month",
                    },
                    footer: {
                        cancel: "Cancel",
                        apply: "Apply",
                    },
                }}
                // Use context value or default value
                value={context?.dateRangeValue ?? defaultDateRange}
                onChange={handleDateRangeValueChange}
                primaryColor={"green"}
                displayFormat={"DD/MM/YYYY"}
                readOnly={true}
                inputClassName={"w-0"}
                containerClassName={""}
                toggleClassName={"border p-3 rounded-[2px]"}
                popoverDirection={"down"}
            />
        </div>
    );
}
