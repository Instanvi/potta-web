'use client';
import React, { useState, useMemo } from 'react';
import Slider from '@potta/components/slideover';
import Input from '@potta/components/input';
import Button from '@potta/components/button';
import SearchableSelect from '@potta/components/searchableSelect';
import { DateInput } from '@potta/components/customDatePicker';
import { useCreateSpendRequest } from '../hooks/useProcurement';
import { SpendRequestItem } from '../utils/types';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSpendPrograms } from '../../spend-program/utils/api';
import { budgetsApi } from '../../budgets/utils/api';
import useGetAllVendors from '../../../vendors/hooks/useGetAllVendors';

interface NewSpendRequestSlideoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreated?: () => void;
}

const NewSpendRequestSlideover: React.FC<NewSpendRequestSlideoverProps> = ({
  open,
  setOpen,
  onCreated,
}) => {
  const createSpendRequestMutation = useCreateSpendRequest();

  // Fetch spend programs
  const { data: spendPrograms = [], isLoading: loadingSpendPrograms } =
    useQuery({
      queryKey: ['spend-programs'],
      queryFn: getSpendPrograms,
    });

  // Fetch budgets
  const { data: budgetsData, isLoading: loadingBudgets } = useQuery({
    queryKey: ['budgets-list'],
    queryFn: () => budgetsApi.getBudgets({ page: 1, limit: 100 }),
  });

  const budgets = budgetsData?.data || [];

  // Fetch vendors
  const { data: vendorsData, isLoading: loadingVendors } = useGetAllVendors({
    page: 1,
    limit: 100,
  });

  const vendors = vendorsData?.data || [];

  // Transform data to options format
  const spendProgramOptions = useMemo(() => {
    return spendPrograms.map((program: any) => ({
      value: program.id || program.uuid,
      label: program.name,
    }));
  }, [spendPrograms]);

  const budgetOptions = useMemo(() => {
    return budgets.map((budget: any) => ({
      value: budget.id || budget.uuid,
      label: budget.allocatedAmount
        ? `${budget.name} (${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
          }).format(budget.allocatedAmount)})`
        : budget.name,
    }));
  }, [budgets]);

  // Priority options
  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  // Vendor options
  const vendorOptions = useMemo(() => {
    return vendors.map((vendor: any) => ({
      value: vendor.uuid || vendor.id, // Store vendor UUID as value
      label: vendor.name,
    }));
  }, [vendors]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [priority, setPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  >('MEDIUM');
  const [justification, setJustification] = useState('');
  const [requiredDate, setRequiredDate] = useState<Date | undefined>(undefined);
  const [comments, setComments] = useState('');
  const [spendProgramId, setSpendProgramId] = useState('');
  const [budgetId, setBudgetId] = useState('');

  // Items state
  const [items, setItems] = useState<SpendRequestItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      category: '',
      specifications: '',
      vendorId: '',
    },
  ]);

  const handleAddItem = () => {
    const newItem: SpendRequestItem = {
      id: `${items.length + 1}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      category: '',
      specifications: '',
      vendorId: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof SpendRequestItem,
    value: any
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Auto-calculate total amount
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalAmount =
              updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Calculate total requested amount from items
  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalAmount = calculateTotalAmount();

    const spendRequestData = {
      title,
      description,
      requestedAmount: totalAmount || parseFloat(requestedAmount) || 0,
      priority,
      items,
      justification,
      requiredDate: requiredDate
        ? requiredDate.toISOString()
        : new Date().toISOString(),
      comments,
      spendProgramId:
        spendProgramId ||
        spendPrograms[0]?.id ||
        'ddc3342e-546c-4921-a4fb-99203cd38e2d',
      budgetId:
        budgetId || budgets[0]?.id || '250eb6d0-5ce1-40eb-8415-3700dd8f15b3',
    };

    try {
      await createSpendRequestMutation.mutateAsync(spendRequestData);

      // Reset form
      setTitle('');
      setDescription('');
      setRequestedAmount('');
      setPriority('MEDIUM');
      setJustification('');
      setRequiredDate(undefined);
      setComments('');
      setSpendProgramId('');
      setBudgetId('');
      setItems([
        {
          id: '1',
          description: '',
          quantity: 1,
          unitPrice: 0,
          totalAmount: 0,
          category: '',
          specifications: '',
          vendorId: '',
        },
      ]);

      setOpen(false);
      onCreated?.();
    } catch (error) {
      console.error('Error creating spend request:', error);
    }
  };

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      title="New Spend Request"
      edit={false}
      closeButton={false}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Basic Information
          </h3>

          <Input
            label="Title"
            type="text"
            name="title"
            placeholder="e.g., Office Furniture Purchase"
            value={title}
            onchange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Describe the purpose of this spend request"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="Priority"
              options={priorityOptions}
              selectedValue={priority}
              onChange={(value) =>
                setPriority(value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
              }
              placeholder="Select priority..."
              required
            />

            <DateInput
              label="Required Date"
              value={requiredDate}
              onChange={setRequiredDate}
              placeholder="Select required date"
              required
              name="requiredDate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Explain why this purchase is needed"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="Spend Program"
              options={spendProgramOptions}
              selectedValue={spendProgramId}
              onChange={setSpendProgramId}
              placeholder="Search spend programs..."
              isDisabled={loadingSpendPrograms}
              required
            />

            <SearchableSelect
              label="Budget"
              options={budgetOptions}
              selectedValue={budgetId}
              onChange={setBudgetId}
              placeholder="Search budgets..."
              isDisabled={loadingBudgets}
              required
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Item {index + 1}
                </h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Description"
                  type="text"
                  name={`item-description-${item.id}`}
                  placeholder="Item description"
                  value={item.description}
                  onchange={(e) =>
                    handleItemChange(item.id, 'description', e.target.value)
                  }
                  required
                />

                <Input
                  label="Category"
                  type="text"
                  name={`item-category-${item.id}`}
                  placeholder="e.g., Furniture"
                  value={item.category}
                  onchange={(e) =>
                    handleItemChange(item.id, 'category', e.target.value)
                  }
                  required
                />

                <Input
                  label="Quantity"
                  type="number"
                  name={`item-quantity-${item.id}`}
                  placeholder="0"
                  value={item.quantity}
                  onchange={(e) =>
                    handleItemChange(
                      item.id,
                      'quantity',
                      parseFloat(e.target.value)
                    )
                  }
                  required
                />

                <Input
                  label="Unit Price (XAF)"
                  type="number"
                  name={`item-unitPrice-${item.id}`}
                  placeholder="0"
                  value={item.unitPrice}
                  onchange={(e) =>
                    handleItemChange(
                      item.id,
                      'unitPrice',
                      parseFloat(e.target.value)
                    )
                  }
                  required
                />

                <SearchableSelect
                  label="Vendor (Optional)"
                  options={vendorOptions}
                  selectedValue={item.vendorId || ''}
                  onChange={(value) =>
                    handleItemChange(item.id, 'vendorId', value)
                  }
                  placeholder="Search vendors..."
                  isDisabled={loadingVendors}
                />

                <div className="flex items-end">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <div className="px-3 py-2 border border-gray-200 md bg-gray-50 text-gray-900 font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0,
                      }).format(item.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="Technical specifications or requirements"
                  value={item.specifications}
                  onChange={(e) =>
                    handleItemChange(item.id, 'specifications', e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Amount Summary */}
        <div className="bg-gray-50 p-4 lg">
          <div className="flex items-center justify-between text-lg font-medium">
            <span className="text-gray-700">Total Requested Amount:</span>
            <span className="text-green-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0,
              }).format(calculateTotalAmount())}
            </span>
          </div>
        </div>

        {/* Additional Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Comments (Optional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={2}
            placeholder="Any additional notes or comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            text={
              createSpendRequestMutation.isPending
                ? 'Creating...'
                : 'Create Spend Request'
            }
            type="submit"
            disabled={createSpendRequestMutation.isPending}
          />
        </div>
      </form>
    </Slider>
  );
};

export default NewSpendRequestSlideover;
