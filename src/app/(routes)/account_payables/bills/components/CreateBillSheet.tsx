"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CustomSheet,
} from "@potta/components/ui/sheet";
import { Input } from "@potta/components/shadcn/input";
import { Label } from "@potta/components/shadcn/label";

interface CreateBillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBillSheet({ open, onOpenChange }: CreateBillSheetProps) {
  const router = useRouter();
  const [vendorName, setVendorName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");

  return (
    <CustomSheet
      open={open}
      onOpenChange={onOpenChange}
      heading="Create Bill"
      description="Quick draft form. Continue in full bill editor after submit."
      cancelText="Cancel"
      confirmText="Continue"
      onConfirm={() => {
        onOpenChange(false);
        router.push("/account_payables/bills/new");
      }}
    >
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vendorName">Vendor Name</Label>
          <Input
            id="vendorName"
            placeholder="Enter vendor name"
            value={vendorName}
            onChange={(event) => setVendorName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            placeholder="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </form>
    </CustomSheet>
  );
}
