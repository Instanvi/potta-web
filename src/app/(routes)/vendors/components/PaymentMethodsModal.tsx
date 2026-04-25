'use client';
import React, { useState, useEffect } from 'react';
import Slider from '@potta/components/slideover';
import {
  VendorPaymentMethod,
  CreatePaymentMethodPayload,
  PaymentMethodType,
} from '../utils/types';
import { vendorApi } from '../utils/api';
import { Badge } from '@potta/components/shadcn/badge';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import TextArea from '@potta/components/textArea';
import Checkbox from '@potta/components/checkbox';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Star,
  Building,
  Smartphone,
  Wallet,
  DollarSign,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { paymentMethodSchema } from '../utils/validations';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  onPaymentMethodChange?: () => void; // Callback to refresh table data
}

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  vendorName,
  onPaymentMethodChange,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<VendorPaymentMethod[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMethod, setEditingMethod] =
    useState<VendorPaymentMethod | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form handling with react-hook-form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreatePaymentMethodPayload>({
    resolver: yupResolver(paymentMethodSchema) as any,
    defaultValues: {
      paymentMethodType: 'BANK_TRANSFER',
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankCode: '',
      phoneNumber: '',
      walletId: '',
      dailyLimit: 0,
      monthlyLimit: 0,
      isPrimary: false,
      isActive: true,
      notes: '',
    },
  });

  const watchedPaymentMethodType = watch('paymentMethodType');

  // Payment method options for Select component
  const paymentMethodOptions = [
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'ACH_TRANSFER', label: 'ACH Transfer' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
    { value: 'CASH', label: 'Cash' },
    { value: 'CREDIT', label: 'Credit' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Fetch payment methods when modal opens
  useEffect(() => {
    if (isOpen && vendorId) {
      fetchPaymentMethods();
    }
  }, [isOpen, vendorId]);

  const fetchPaymentMethods = async () => {
    if (!vendorId) return;

    setIsLoading(true);
    try {
      const methods = await vendorApi.paymentMethods.getAll(vendorId);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async (data: CreatePaymentMethodPayload) => {
    if (!vendorId) return;

    setIsAdding(true);
    try {
      const newMethod = await vendorApi.paymentMethods.create(vendorId, data);
      setPaymentMethods((prev) => [...prev, newMethod]);
      setShowAddForm(false);
      reset();
      toast.success('Payment method added successfully!');

      // Trigger table refresh if callback is provided
      if (onPaymentMethodChange) {
        onPaymentMethodChange();
      }
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdatePaymentMethod = async (
    data: CreatePaymentMethodPayload
  ) => {
    if (!vendorId || !editingMethod) return;

    setIsEditing(true);
    try {
      const updatedMethod = await vendorApi.paymentMethods.update(
        vendorId,
        editingMethod.uuid,
        data
      );
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.uuid === editingMethod.uuid ? updatedMethod : method
        )
      );
      setEditingMethod(null);
      reset();
      toast.success('Payment method updated successfully!');

      // Trigger table refresh if callback is provided
      if (onPaymentMethodChange) {
        onPaymentMethodChange();
      }
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!vendorId) return;

    try {
      await vendorApi.paymentMethods.delete(vendorId, methodId);
      setPaymentMethods((prev) =>
        prev.filter((method) => method.uuid !== methodId)
      );
      toast.success('Payment method deleted successfully!');

      // Trigger table refresh if callback is provided
      if (onPaymentMethodChange) {
        onPaymentMethodChange();
      }
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleVerifyPaymentMethod = async (methodId: string) => {
    if (!vendorId) return;

    try {
      const method = paymentMethods.find((m) => m.uuid === methodId);
      if (!method) return;

      const verificationData = {
        verificationNotes: 'Payment method verified and approved for use',
      };

      const verifiedMethod = await vendorApi.paymentMethods.verify(
        vendorId,
        methodId,
        verificationData
      );

      setPaymentMethods((prev) =>
        prev.map((m) => (m.uuid === methodId ? verifiedMethod : m))
      );

      toast.success('Payment method verified successfully!');

      // Trigger table refresh if callback is provided
      if (onPaymentMethodChange) {
        onPaymentMethodChange();
      }
    } catch (error) {
      console.error('Failed to verify payment method:', error);
      toast.error('Failed to verify payment method');
    }
  };

  const handleSetPrimary = async (methodId: string) => {
    if (!vendorId) return;

    try {
      await vendorApi.paymentMethods.setPrimary(vendorId, methodId);
      setPaymentMethods((prev) =>
        prev.map((method) => ({
          ...method,
          isPrimary: method.uuid === methodId,
        }))
      );
      toast.success('Primary payment method updated!');

      // Trigger table refresh if callback is provided
      if (onPaymentMethodChange) {
        onPaymentMethodChange();
      }
    } catch (error) {
      console.error('Failed to set primary payment method:', error);
      toast.error('Failed to set primary payment method');
    }
  };

  const startEdit = (method: VendorPaymentMethod) => {
    setEditingMethod(method);
    reset({
      paymentMethodType: method.paymentMethodType,
      accountName: method.accountName || '',
      accountNumber: method.accountNumber || '',
      bankName: method.bankName || '',
      bankCode: method.bankCode || '',
      phoneNumber: method.phoneNumber || '',
      walletId: method.walletId || '',
      dailyLimit: Number(method.dailyLimit) || 0,
      monthlyLimit: Number(method.monthlyLimit) || 0,
      isPrimary: method.isPrimary || false,
      isActive: method.isActive || true,
      notes: method.notes || '',
    });
    setShowAddForm(true);
  };

  const getPaymentMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'BANK_TRANSFER':
      case 'ACH_TRANSFER':
        return <Building className="h-5 w-5 text-blue-600" />;
      case 'MOBILE_MONEY':
        return <Smartphone className="h-5 w-5 text-green-600" />;
      case 'CREDIT_CARD':
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      case 'DIGITAL_WALLET':
        return <Wallet className="h-5 w-5 text-indigo-600" />;
      case 'CASH':
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      case 'CREDIT':
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = (type: PaymentMethodType) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Slider
      open={isOpen}
      setOpen={onClose}
      edit={false}
      title={`Payment Methods - ${vendorName}`}
    >
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">
              Loading payment methods...
            </span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-medium text-gray-900">
                  Payment Methods
                </h2>
                <p className="text-gray-600">
                  Manage payment methods for {vendorName}
                </p>
              </div>
              <Button
                text="Add Payment Method"
                onClick={() => {
                  reset();
                  setEditingMethod(null);
                  setShowAddForm(true);
                }}
                theme="default"
                type="button"
                icon={<Plus className="h-4 w-4" />}
              />
            </div>

            {/* Add/Edit Form */}
            <div
              className={`bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 ${
                showAddForm
                  ? 'opacity-100 max-h-screen'
                  : 'opacity-0 max-h-0 overflow-hidden'
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMethod
                  ? 'Edit Payment Method'
                  : 'Add New Payment Method'}
              </h3>

              <form
                onSubmit={handleSubmit(
                  editingMethod
                    ? handleUpdatePaymentMethod
                    : (handleAddPaymentMethod as any)
                )}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Controller
                      name="paymentMethodType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={paymentMethodOptions}
                          selectedValue={field.value}
                          onChange={field.onChange}
                          bg="bg-white"
                          name="Payment Method Type"
                          label="Payment Method Type"
                          required
                        />
                      )}
                    />
                  </div>

                  {watchedPaymentMethodType !== 'MOBILE_MONEY' && (
                    <Input
                      label="Account Name"
                      type="text"
                      name="accountName"
                      placeholder="Enter account name"
                      register={register}
                      errors={errors.accountName}
                    />
                  )}

                  {watchedPaymentMethodType === 'BANK_TRANSFER' && (
                    <>
                      <Input
                        label="Account Number"
                        type="text"
                        name="accountNumber"
                        placeholder="Enter account number"
                        register={register}
                        errors={errors.accountNumber}
                      />
                      <Input
                        label="Bank Name"
                        type="text"
                        name="bankName"
                        placeholder="Enter bank name"
                        register={register}
                        errors={errors.bankName}
                      />
                    </>
                  )}

                  {watchedPaymentMethodType === 'MOBILE_MONEY' && (
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phoneNumber"
                      placeholder="Enter phone number"
                      register={register}
                      errors={errors.phoneNumber}
                    />
                  )}

                  <Input
                    label="Daily Limit"
                    type="number"
                    name="dailyLimit"
                    placeholder="0"
                    register={register}
                    errors={errors.dailyLimit}
                  />

                  <Input
                    label="Monthly Limit"
                    type="number"
                    name="monthlyLimit"
                    placeholder="0"
                    register={register}
                    errors={errors.monthlyLimit}
                  />
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <Controller
                    name="isPrimary"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="isPrimary"
                        label="Set as Primary"
                        checked={field.value || false}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="isActive"
                        label="Active"
                        checked={field.value || false}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="mb-4">
                  <TextArea
                    label="Notes"
                    name="notes"
                    placeholder="Enter any additional notes"
                    register={register}
                    errors={errors.notes}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    text="Cancel"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingMethod(null);
                      reset();
                    }}
                    theme="lightBlue"
                    type="button"
                  />
                  <Button
                    text={
                      editingMethod
                        ? 'Update Payment Method'
                        : 'Add Payment Method'
                    }
                    isLoading={isAdding || isEditing}
                    theme="default"
                    type="submit"
                  />
                </div>
              </form>
            </div>

            {/* Payment Methods List */}
            {paymentMethods.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Payment Methods
                </h3>
                <p className="text-gray-500 mb-6">
                  This vendor doesn't have any payment methods configured yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.uuid}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getPaymentMethodIcon(method.paymentMethodType)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {getPaymentMethodLabel(method.paymentMethodType)}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {method.accountName ||
                              method.phoneNumber ||
                              'No identifier'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.verifiedAt && (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {method.isPrimary && (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                        <Badge
                          className={`${
                            method.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          } flex items-center gap-1`}
                        >
                          {method.isActive ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {method.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {method.accountNumber && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Account Number
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {method.accountNumber
                              .replace(/(.{4})/g, '$1 ')
                              .trim()}
                          </p>
                        </div>
                      )}
                      {method.bankName && (
                        <div>
                          <p className="text-sm text-gray-500">Bank</p>
                          <p className="text-sm font-medium text-gray-900">
                            {method.bankName}
                          </p>
                        </div>
                      )}
                      {method.phoneNumber && (
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {method.phoneNumber}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Daily Limit</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(Number(method.dailyLimit) || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monthly Limit</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(Number(method.monthlyLimit) || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(method.createdAt)}
                        </p>
                      </div>
                    </div>

                    {method.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {method.notes}
                        </p>
                      </div>
                    )}

                    {method.verifiedAt && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 ">
                        <div className="flex items-start space-x-2">
                          <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              Verified Payment Method
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Verified on: {formatDate(method.verifiedAt)}
                            </p>
                            {method.verificationNotes && (
                              <p className="text-xs text-blue-700 mt-1">
                                {method.verificationNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      {!method.verifiedAt && (
                        <Button
                          text="Verify"
                          onClick={() => handleVerifyPaymentMethod(method.uuid)}
                          theme="default"
                          type="button"
                          icon={<ShieldCheck className="h-4 w-4" />}
                        />
                      )}
                      {!method.isPrimary && (
                        <Button
                          text="Set Primary"
                          onClick={() => handleSetPrimary(method.uuid)}
                          theme="lightBlue"
                          type="button"
                          icon={<Star className="h-4 w-4" />}
                        />
                      )}
                      <Button
                        text="Edit"
                        onClick={() => startEdit(method)}
                        theme="lightBlue"
                        type="button"
                        icon={<Edit className="h-4 w-4" />}
                      />
                      <Button
                        text="Delete"
                        onClick={() => handleDeletePaymentMethod(method.uuid)}
                        theme="red"
                        type="button"
                        icon={<Trash2 className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Slider>
  );
};

export default PaymentMethodsModal;
