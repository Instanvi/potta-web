// components/PolicyEditor.tsx
'use client'; // This component uses hooks, so it needs to be a Client Component

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';

import { X } from 'lucide-react'; // npm install lucide-react

import type {
  Approver,
  Rule,
  PolicyState,
  RuleCondition,
  RuleField,
  Currency,
} from '../types/policy'; // Adjust path if needed
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { Button } from '@potta/components/shadcn/button';
import { Badge } from '@potta/components/shadcn/badge';
import Input from '@potta/components/input';

// Mock data - replace with actual data fetching or props
const availableApprovers: Approver[] = [
  { id: '1', name: 'Akoh Paul' },
  { id: '2', name: 'Jessica Paul' },
  { id: '3', name: 'John Palma' },
  { id: '4', name: 'Mark Pence' },
  { id: '5', name: 'Paul Gambit' },
  { id: '6', name: 'Sarah Connor' },
];

const initialPolicyState: PolicyState = {
  policyName: 'September Attendees', // Or leave empty: ''
  rules: [
    {
      id: uuidv4(),
      field: 'Transaction Amount',
      condition: 'Is Above',
      value: '5000',
      currency: 'USD',
    },
    {
      id: uuidv4(),
      field: 'Transaction Amount',
      condition: 'Below',
      value: '5000',
      currency: 'USD',
    },
  ],
  eitherByApprovers: [
    { id: '1', name: 'Akoh Paul' },
    // { id: '1', name: 'Akoh Paul' }, // Note: Original UI shows duplicate, handle as needed
    { id: '5', name: 'Paul Gambit' },
  ],
  allByApprovers: [
    { id: '1', name: 'Akoh Paul' },
    // { id: '1', name: 'Akoh Paul' }, // Note: Original UI shows duplicate, handle as needed
    { id: '5', name: 'Paul Gambit' },
  ],
};

const PolicyEditor: React.FC = () => {
  const [policyState, setPolicyState] =
    useState<PolicyState>(initialPolicyState);

  // --- Rule Handlers ---
  const handleRuleChange = <K extends keyof Rule>(
    id: string,
    field: K,
    value: Rule[K]
  ) => {
    setPolicyState((prevState) => ({
      ...prevState,
      rules: prevState.rules.map((rule) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const addRule = () => {
    setPolicyState((prevState) => ({
      ...prevState,
      rules: [
        ...prevState.rules,
        {
          id: uuidv4(),
          field: 'Transaction Amount',
          condition: 'Is Above',
          value: '',
          currency: 'USD',
        },
      ],
    }));
  };

  const removeRule = (id: string) => {
    setPolicyState((prevState) => ({
      ...prevState,
      rules: prevState.rules.filter((rule) => rule.id !== id),
    }));
  };

  // --- Approver Handlers ---
  // NOTE: The "Mark Pence" dropdowns in the original UI might be for *adding*
  // approvers. This implementation focuses on displaying/removing existing ones.
  // You'd need a more complex selector (like Combobox) to implement adding.

  const removeApprover = (
    listType: 'eitherBy' | 'allBy',
    idToRemove: string
  ) => {
    const key =
      listType === 'eitherBy' ? 'eitherByApprovers' : 'allByApprovers';
    setPolicyState((prevState) => ({
      ...prevState,
      [key]: prevState[key].filter((approver) => approver.id !== idToRemove),
    }));
  };

  // --- Policy Name Handler ---
  const handlePolicyNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPolicyState((prevState) => ({
      ...prevState,
      policyName: event.target.value,
    }));
  };

  // --- Save/Cancel Handlers ---
  const handleSavePolicy = () => {
    console.log('Saving Policy:', policyState);
    // Add API call logic here
  };

  const handleCancel = () => {
    console.log('Cancelled');
    // Add navigation or reset logic here
    setPolicyState(initialPolicyState); // Example reset
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-6">
      {/* Rules Section */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          {policyState.rules.map((rule, index) => (
            <div
              key={rule.id}
              className="p-4 py-8 border-dotted border border-green-600 bg-white rounded-xs space-y-3 relative shadow-sm"
            >
              <span className=" font-medium">When</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                {/* Field (Readonly for now, make Select if needed) */}
                <div className="col-span-1 sm:col-span-1">
                  {/* Could be a Select if multiple fields are possible */}
                  <Input value={rule.field} name="field" type="text" />
                </div>

                {/* Condition */}
                <div className="col-span-1 sm:col-span-1">
                  <Select
                    value={rule.condition}
                    onValueChange={(value: RuleCondition) =>
                      handleRuleChange(rule.id, 'condition', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Is Above">Is Above</SelectItem>
                      <SelectItem value="Below">Below</SelectItem>
                      <SelectItem value="Equals">Equals</SelectItem>
                      {/* Add other conditions */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value */}
                <div className="col-span-1 sm:col-span-1">
                  <Input
                    name="id"
                    type="number"
                    placeholder="Value"
                    value={rule.value}
                    onchange={(e) =>
                      handleRuleChange(rule.id, 'value', e.target.value)
                    }
                  />
                </div>

                {/* Currency */}
                <div className="col-span-1 sm:col-span-1">
                  <Select
                    value={rule.currency}
                    onValueChange={(value: Currency) =>
                      handleRuleChange(rule.id, 'currency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="XAF">XAF</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      {/* Add other currencies */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Remove Rule Button */}
              {policyState.rules.length > 1 && ( // Only show remove if more than one rule exists
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  onClick={() => removeRule(rule.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={addRule}
              className=" "
              size="lg"
            >
              New Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approvers Section */}
      <Card className='border-0'>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Approvers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Either By Section */}
          <div  className="p-4 py-8 border-dotted border border-green-600 bg-white rounded-xs space-y-3 relative shadow-sm">
            <div className="flex items-center gap-4">
              <Select defaultValue="either">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="either">Either By</SelectItem>
                </SelectContent>
              </Select>
              {/* Placeholder for Approver Selection Dropdown */}
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select approver..." />
                </SelectTrigger>
                <SelectContent>
                  {availableApprovers.map((ap) => (
                    <SelectItem key={ap.id} value={ap.id}>
                      {ap.name}
                    </SelectItem>
                  ))}
                  {/* TODO: Add logic to add selected approver to the list */}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {policyState.eitherByApprovers.map((approver) => (
                <Badge
                  key={approver.id}
                  variant="secondary"
                  className="flex items-center  p-1 px-2 bg-white rounded-full border hover:bg-white gap-6 border-gray-300"
                >
                  {/* Add avatar here if needed */}
                  <span>{approver.name}</span>
                  <button
                    onClick={() => removeApprover('eitherBy', approver.id)}
                    className="rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label={`Remove ${approver.name}`}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* By All Of Section */}
          <div  className="p-4 py-8 border-dotted border-2 border-green-600 bg-white rounded-xs space-y-3 relative shadow-sm">
            <div className="flex justify items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">By All of</SelectItem>
                </SelectContent>
              </Select>
              {/* Placeholder for Approver Selection Dropdown */}
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select approver..." />
                </SelectTrigger>
                <SelectContent>
                  {availableApprovers.map((ap) => (
                    <SelectItem key={ap.id} value={ap.id}>
                      {ap.name}
                    </SelectItem>
                  ))}
                  {/* TODO: Add logic to add selected approver to the list */}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {policyState.allByApprovers.map((approver) => (
                <Badge
                  key={approver.id}
                  variant="secondary"
                   className="flex items-center  p-1 px-2 bg-white rounded-full border hover:bg-white gap-6 border-gray-300"
                >
                  <span>{approver.name}</span>
                  <button
                    onClick={() => removeApprover('allBy', approver.id)}
                    className="rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label={`Remove ${approver.name}`}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer/Actions */}
      <div className="space-y-4 flex justify-between items-center pt-6 mx-6 border-t">
        <Input
          type="text"
          name="policyName"
          placeholder="Policy name or description (e.g., September Attendees)"
          value={policyState.policyName}
          onchange={handlePolicyNameChange}
          className="max-w-sm"
        />
        <div className="flex justify-end gap-3">
          <Button variant="destructive" size="lg" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
          variant="default"
          size="lg"
            onClick={handleSavePolicy}
            className=" text-white"
          >
            Save Policy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PolicyEditor;
