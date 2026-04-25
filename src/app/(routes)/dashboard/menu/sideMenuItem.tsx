import React, { FC } from "react";

interface SmallSideMenuItemProps {
    href: string;
    icon: string;
    active: boolean;
    text: string;
}

function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
}

const SmallSideMenuItem: FC<SmallSideMenuItemProps> = ({ href, icon, active, text }) => {

    return (
        <div className="group flex">
            <a href={href} className="flex items-center">
                <li
                    className={classNames(
                        active
                            ? "font-medium border-r-2 border-[#154406] text-[#154406]"
                            : "text-gray-500 hover:text-white hover:bg-[#154406] group-hover:text-white group-hover:bg-[#154406]",
                        "text-sm relative flex items-center py-2 px-4 cursor-pointer"
                    )}
                >
                    <i className={`${icon} text text-[22px]`}></i>
                </li>
            </a>
            <div className={`${active ? "hidden" : "absolute capitalize px-2 py-2 text-sm bg-[#154406] text-white left-full -ml-1 invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 w-28 items-center"}`}>
                <a href={href} className="px-2 py-2">{text}</a>
            </div>
        </div>
    );
}

export default SmallSideMenuItem;

interface LargeSideMenuItemProps {
    text: string;
    href: string;
    icon: string;
    active: boolean;
}

export const LargeSideMenuItem: FC<LargeSideMenuItemProps> = ({ text, href, icon, active }) => {

    return (
        <li>
            <a
                href={href}
                className={classNames(
                    active
                        ? " font-medium border-r-2 border-[#154406] text-[#154406]"
                        : "text-gray-500 hover:text-[#154406] hover:bg-gray-50",
                    " py-4 text-sm font-medium flex px-10 capitalize"
                )}
            >
                <i className={`${icon} -mt-1 text-xl mr-2`}></i>
                {text}
            </a>
        </li>
    );
}