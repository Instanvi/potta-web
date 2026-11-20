import React, { useState, FC, ReactNode } from "react";
import CustomPopover from "./popover";
import DateRangePickerComponent from "./daterangePicker";

interface FilterComponentProps {
    includeSearch: boolean;
    placeholder: string;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    includeSort: boolean;
    activeSort: (isSorted: boolean) => void;
    includeDatePicker: boolean;
    includePopover: boolean;
    children: ReactNode;
}

const FilterComponent: FC<FilterComponentProps> = ({
    includeSearch,
    placeholder,
    handleSearchChange,
    includeSort,
    activeSort,
    includeDatePicker,
    includePopover,
    children,
}) => {
    const [dataIsSorted, setDataIsSorted] = useState<boolean>(true);

    const handleSort = () => {
        setDataIsSorted(!dataIsSorted);
        activeSort(dataIsSorted);
    };

    return (
        <div className="flex grow items-center gap-2">
            <div
                className={`flex items-center gap-x-3 border rounded-sm px-4 w-full md:w-2/4 ${includeSearch ? "" : "hidden"
                    }`}
            >
                <i className="ri-search-line text-xl"></i>
                <input
                    type="search"
                    name="search"
                    id="search"
                    className="w-full py-2.5 outline-none pl-1"
                    placeholder={placeholder}
                    onChange={handleSearchChange}
                />
            </div>
            <div
                title="Sort"
                className={`flex border rounded-sm cursor-pointer py-1.5 px-2 ${includeSort ? "" : "hidden"
                    }`}
                onClick={() => handleSort()}
            >
                <i
                    className={`${dataIsSorted ? "ri-sort-asc" : "ri-sort-desc"} text-2xl`}
                ></i>
            </div>

            <div className={`flex ${includeDatePicker ? "" : "hidden"}`}>
                <DateRangePickerComponent />
            </div>

            <div className={`flex ${includePopover ? "" : "hidden"}`}>
                <CustomPopover>{children}</CustomPopover>
            </div>
        </div>
    );
}

export default FilterComponent;