"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@potta/components/shadcn/tabs";
import { cn } from "@potta/lib/utils";

type TabItem = {
  label: string;
  value: string;
  href: string;
  count?: number;
};

interface AccountPayablesTabsProps {
  tabs?: TabItem[];
  className?: string;
}

const defaultTabs: TabItem[] = [
  { label: "Transaction", value: "transactions", href: "/account_payables/transactions" },
  { label: "Bills", value: "bills", href: "/account_payables/bills" },
  { label: "Reimbursements", value: "reimbursements", href: "/account_payables/re-imbursements" },
  { label: "Terminals", value: "terminals", href: "/payments/terminals" },
];

export function AccountPayablesTabs({
  tabs = defaultTabs,
  className,
}: AccountPayablesTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab =
    tabs.find((tab) => pathname.startsWith(tab.href))?.value ?? tabs[0]?.value;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const selected = tabs.find((tab) => tab.value === value);
        if (selected) {
          router.push(selected.href);
        }
      }}
      className={cn("w-full", className)}
    >
      <TabsList className="h-auto w-full justify-start gap-3 rounded-none bg-[#EEF3F3] p-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-2 text-2xl font-medium text-gray-500 data-[state=active]:border-green-700 data-[state=active]:bg-transparent data-[state=active]:text-green-700 data-[state=active]:shadow-none"
            )}
          >
            <span className="mr-2 text-[18px]">{tab.label}</span>
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs",
                  activeTab === tab.value
                    ? "bg-green-700 text-white"
                    : "bg-gray-300 text-white"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
