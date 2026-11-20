import React, { useState, useEffect } from 'react';
import Slider from '@potta/components/slideover';
import Input from '@potta/components/input';
import SearchableSelect from '@potta/components/searchableSelect';
import Button from '@potta/components/button';
import { useForm, Controller } from 'react-hook-form';
import { DateInput } from '@potta/components/customDatePicker';
import { vendorApi } from '../../../vendors/utils/api';
import { Vendor } from '../../../vendors/utils/types';
import CurrencyInput from '@potta/components/currencyInput';
import { accountsApi } from '../../utils/api';
import { useMemo } from 'react';
import { useCreateAsset } from '../hooks/useCreateAsset';
import toast from 'react-hot-toast';
import { createAssetSchema } from '../utils/validation';
import { fetchPurchaseOrders } from '@potta/app/(routes)/account_payables/purchase/utils/api';

const assetTypeOptions = [
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Vehicle', value: 'Vehicle' },
  { label: 'Building', value: 'Building' },
  { label: 'Furniture', value: 'Furniture' },
  { label: 'Land', value: 'Land' },
  { label: 'Intangible', value: 'Intangible' },
  { label: 'Computer', value: 'Computer' },
  { label: 'Other', value: 'Other' },
];
const depreciationMethodOptions = [
  { label: 'Straight Line', value: 'Straight Line' },
  { label: 'Declining Balance', value: 'Declining Balance' },
];
const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

const AddAssetSlideover = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  const { register, control, handleSubmit } = useForm();
  const [vendorOptions, setVendorOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [acquisitionDate, setAcquisitionDate] = useState<Date | undefined>(
    undefined
  );
  const [purchaseOrderOptions, setPurchaseOrderOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<string>('');
  const [acquisitionCost, setAcquisitionCost] = useState<string>('');
  const [salvageValue, setSalvageValue] = useState<string>('');

  // GL Account search state
  const [glAssetAccountOptions, setGlAssetAccountOptions] = useState<any[]>([]);
  const [glDepExpAccountOptions, setGlDepExpAccountOptions] = useState<any[]>(
    []
  );
  const [glAccumDepAccountOptions, setGlAccumDepAccountOptions] = useState<
    any[]
  >([]);
  const [glAssetAccountId, setGlAssetAccountId] = useState('');
  const [glDepExpAccountId, setGlDepExpAccountId] = useState('');
  const [glAccumDepAccountId, setGlAccumDepAccountId] = useState('');
  const [loadingGlAsset, setLoadingGlAsset] = useState(false);
  const [loadingGlDepExp, setLoadingGlDepExp] = useState(false);
  const [loadingGlAccumDep, setLoadingGlAccumDep] = useState(false);

  // Controlled select state for asset type, status, depreciation method
  const [assetType, setAssetType] = useState('');
  const [status, setStatus] = useState('');
  const [depreciationMethod, setDepreciationMethod] = useState('');

  // Add state for all form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [usefulLifeYears, setUsefulLifeYears] = useState('');
  const [location, setLocation] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Handlers for async search (merge new results into options, avoid duplicates)
  const handleGlAssetSearch = (inputValue: string) => {
    setLoadingGlAsset(true);
    accountsApi
      .getFiltered({ search: inputValue, filter: ['code'], limit: 10 })
      .then((response) => {
        const searchResults = response.data || [];
        setGlAssetAccountOptions((prev) => {
          const all = [...prev];
          searchResults.forEach((acc: any) => {
            if (!all.some((a) => a.uuid === acc.uuid)) {
              all.push(acc);
            }
          });
          return all;
        });
      })
      .catch(() => setGlAssetAccountOptions([]))
      .finally(() => setLoadingGlAsset(false));
    return inputValue;
  };
  const handleGlDepExpSearch = (inputValue: string) => {
    setLoadingGlDepExp(true);
    accountsApi
      .getFiltered({ search: inputValue, filter: ['code'], limit: 10 })
      .then((response) => {
        const searchResults = response.data || [];
        setGlDepExpAccountOptions((prev) => {
          const all = [...prev];
          searchResults.forEach((acc: any) => {
            if (!all.some((a) => a.uuid === acc.uuid)) {
              all.push(acc);
            }
          });
          return all;
        });
      })
      .catch(() => setGlDepExpAccountOptions([]))
      .finally(() => setLoadingGlDepExp(false));
    return inputValue;
  };
  const handleGlAccumDepSearch = (inputValue: string) => {
    setLoadingGlAccumDep(true);
    accountsApi
      .getFiltered({ search: inputValue, filter: ['code'], limit: 10 })
      .then((response) => {
        const searchResults = response.data || [];
        setGlAccumDepAccountOptions((prev) => {
          const all = [...prev];
          searchResults.forEach((acc: any) => {
            if (!all.some((a) => a.uuid === acc.uuid)) {
              all.push(acc);
            }
          });
          return all;
        });
      })
      .catch(() => setGlAccumDepAccountOptions([]))
      .finally(() => setLoadingGlAccumDep(false));
    return inputValue;
  };

  // Fetch vendors for the select
  useEffect(() => {
    async function fetchVendors() {
      const res = await vendorApi.getAll({ limit: 50 });
      if (res && res.data) {
        setVendorOptions(
          res.data.map((v: Vendor) => ({
            label: v.name || v.uuid,
            value: v.uuid,
          }))
        );
      }
    }
    fetchVendors();
  }, []);

  // Fetch purchase orders for the select
  useEffect(() => {
    async function fetchPOs() {
      const res = await fetchPurchaseOrders({ limit: 50, page: 1 });
      if (res && res.data) {
        setPurchaseOrderOptions(
          res.data.map((po: { uuid: string; orderNumber: string }) => ({
            label: po.orderNumber,
            value: po.uuid,
          }))
        );
      }
    }
    fetchPOs();
  }, []);

  // Memoized options with selected value always present
  const glAssetAccountOptionsWithSelected = useMemo(() => {
    const opts = glAssetAccountOptions.map((account: any) => ({
      label: `${account.code || ''} - ${account.name}`,
      value: account.uuid,
    }));
    if (
      glAssetAccountId &&
      !opts.some((opt) => opt.value === glAssetAccountId)
    ) {
      opts.push({ label: glAssetAccountId, value: glAssetAccountId });
    }
    return opts;
  }, [glAssetAccountOptions, glAssetAccountId]);

  const glDepExpAccountOptionsWithSelected = useMemo(() => {
    const opts = glDepExpAccountOptions.map((account: any) => ({
      label: `${account.code || ''} - ${account.name}`,
      value: account.uuid,
    }));
    if (
      glDepExpAccountId &&
      !opts.some((opt) => opt.value === glDepExpAccountId)
    ) {
      opts.push({ label: glDepExpAccountId, value: glDepExpAccountId });
    }
    return opts;
  }, [glDepExpAccountOptions, glDepExpAccountId]);

  const glAccumDepAccountOptionsWithSelected = useMemo(() => {
    const opts = glAccumDepAccountOptions.map((account: any) => ({
      label: `${account.code || ''} - ${account.name}`,
      value: account.uuid,
    }));
    if (
      glAccumDepAccountId &&
      !opts.some((opt) => opt.value === glAccumDepAccountId)
    ) {
      opts.push({ label: glAccumDepAccountId, value: glAccumDepAccountId });
    }
    return opts;
  }, [glAccumDepAccountOptions, glAccumDepAccountId]);

  const createAsset = useCreateAsset();

  // Form submit handler
  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setLoading(true);
    // Build payload as per API
    const payload = {
      name,
      description,
      asset_type: assetType,
      acquisition_date: acquisitionDate
        ? acquisitionDate.toISOString().slice(0, 10)
        : '',
      acquisition_cost: acquisitionCost
        ? parseFloat(acquisitionCost)
        : undefined,
      useful_life_years: usefulLifeYears
        ? parseInt(usefulLifeYears)
        : undefined,
      salvage_value: salvageValue ? parseFloat(salvageValue) : undefined,
      depreciation_method: depreciationMethod,
      location,
      status,
      serial_number: serialNumber,
      vendor_id: selectedVendor,
      purchase_invoice_id: selectedPurchaseOrder,
      gl_asset_account_id: glAssetAccountId,
      gl_depreciation_expense_account_id: glDepExpAccountId,
      gl_accum_depreciation_account_id: glAccumDepAccountId,
    };
    try {
      await createAssetSchema.validate(payload, { abortEarly: false });
    } catch (validationError: any) {
      const errors: Record<string, string> = {};
      if (validationError.inner && validationError.inner.length > 0) {
        validationError.inner.forEach((err: any) => {
          if (err.path) errors[err.path] = err.message;
        });
      } else if (validationError.path) {
        errors[validationError.path] = validationError.message;
      }
      setFormErrors(errors);
      setLoading(false);
      return;
    }
    try {
      await createAsset.mutateAsync(payload);
      toast.success('Asset created successfully!');
      setOpen(false);
      // Reset all form state
      setName('');
      setDescription('');
      setAssetType('');
      setAcquisitionDate(undefined);
      setAcquisitionCost('');
      setUsefulLifeYears('');
      setSalvageValue('');
      setDepreciationMethod('');
      setLocation('');
      setStatus('');
      setSerialNumber('');
      setSelectedVendor('');
      setSelectedPurchaseOrder('');
      setGlAssetAccountId('');
      setGlDepExpAccountId('');
      setGlAccumDepAccountId('');
      setFormErrors({});
    } catch (err) {
      toast.error('Failed to create asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slider
      edit={false}
      title="Create Asset"
      open={open}
      setOpen={setOpen}
      noPanelScroll={true}
      buttonText="assets"
    >
      <div className="w-full max-w-5xl mx-auto">
        <form className=" flex flex-row gap-8">
          {/* Left Side */}
          <div className="flex-1 flex flex-col gap-4">
            <Input
              label="Asset Name"
              name="name"
              type="text"
              value={name}
              onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
              errors={formErrors.name}
              placeholder="e.g. Dell Latitude Laptop"
            />
            <Input
              label="Description"
              name="description"
              type="text"
              value={description}
              onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDescription(e.target.value)
              }
              required
              errors={formErrors.description}
              placeholder="e.g. High-performance laptop for engineering team"
            />
            <SearchableSelect
              label="Asset Type"
              options={assetTypeOptions}
              selectedValue={assetType}
              onChange={setAssetType}
              required
              error={formErrors.asset_type}
              placeholder="Select asset type"
            />
            <DateInput
              label="Acquisition Date"
              name="acquisition_date"
              value={acquisitionDate}
              onChange={setAcquisitionDate}
              required
              errors={formErrors.acquisition_date}
              placeholder="YYYY-MM-DD"
            />
            <CurrencyInput
              label="Acquisition Cost"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(e.target.value)}
              required
              error={formErrors.acquisition_cost}
              placeholder="e.g. 1500"
            />
            <Input
              label="Useful Life (years)"
              name="useful_life_years"
              type="number"
              value={usefulLifeYears}
              onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsefulLifeYears(e.target.value)
              }
              required
              min={0}
              errors={formErrors.useful_life_years}
              placeholder="e.g. 5"
            />
            <CurrencyInput
              label="Salvage Value"
              value={salvageValue}
              onChange={(e) => setSalvageValue(e.target.value)}
              required
              error={formErrors.salvage_value}
              placeholder="e.g. 200"
            />
            <SearchableSelect
              label="Depreciation Method"
              options={depreciationMethodOptions}
              selectedValue={depreciationMethod}
              onChange={setDepreciationMethod}
              required
              error={formErrors.depreciation_method}
              placeholder="Select depreciation method"
            />
          </div>
          {/* Right Side */}
          <div className="flex-1 flex flex-col gap-4">
            <Input
              label="Location"
              name="location"
              type="text"
              value={location}
              onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLocation(e.target.value)
              }
              required
              errors={formErrors.location}
              placeholder="e.g. Douala HQ - Finance Office"
            />
            <SearchableSelect
              label="Status"
              options={statusOptions}
              selectedValue={status}
              onChange={setStatus}
              required
              error={formErrors.status}
              placeholder="Select status"
            />
            <Input
              label="Serial Number"
              name="serial_number"
              type="text"
              value={serialNumber}
              onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSerialNumber(e.target.value)
              }
              errors={formErrors.serial_number}
              placeholder="e.g. SN-DL-45678-XC"
            />
            <SearchableSelect
              label="Vendor"
              options={vendorOptions}
              selectedValue={selectedVendor}
              onChange={setSelectedVendor}
              required
              error={formErrors.vendor_id}
              placeholder="Select vendor"
            />
            <SearchableSelect
              label="Purchase Invoice ID"
              options={purchaseOrderOptions}
              selectedValue={selectedPurchaseOrder}
              onChange={setSelectedPurchaseOrder}
              required
              error={formErrors.purchase_invoice_id}
              placeholder="Select purchase invoice"
            />
            <SearchableSelect
              label="GL Asset Account ID*"
              options={glAssetAccountOptionsWithSelected}
              selectedValue={glAssetAccountId}
              onChange={setGlAssetAccountId}
              onInputChange={handleGlAssetSearch}
              isLoading={loadingGlAsset}
              required
              error={formErrors.gl_asset_account_id}
              placeholder="Search by code or name"
            />
            <SearchableSelect
              label="GL Depreciation Expense Account ID*"
              options={glDepExpAccountOptionsWithSelected}
              selectedValue={glDepExpAccountId}
              onChange={setGlDepExpAccountId}
              onInputChange={handleGlDepExpSearch}
              isLoading={loadingGlDepExp}
              required
              error={formErrors.gl_depreciation_expense_account_id}
              placeholder="Search by code or name"
            />
            <SearchableSelect
              label="GL Accum. Depreciation Account ID*"
              options={glAccumDepAccountOptionsWithSelected}
              selectedValue={glAccumDepAccountId}
              onChange={setGlAccumDepAccountId}
              onInputChange={handleGlAccumDepSearch}
              isLoading={loadingGlAccumDep}
              required
              error={formErrors.gl_accum_depreciation_account_id}
              placeholder="Search by code or name"
            />
          </div>
        </form>
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            onClick={handleAssetSubmit as any}
            text="Save Asset"
            type="submit"
            isLoading={loading}
            disabled={loading}
          />
        </div>
      </div>
    </Slider>
  );
};

export default AddAssetSlideover;
