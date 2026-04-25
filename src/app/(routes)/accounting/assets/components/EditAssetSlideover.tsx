import React, { useEffect, useState } from 'react';
import Slider from '@potta/components/slideover';
import Input from '@potta/components/input';
import SearchableSelect from '@potta/components/searchableSelect';
import Button from '@potta/components/button';
import { DateInput } from '@potta/components/customDatePicker';
import CurrencyInput from '@potta/components/currencyInput';
import { accountsApi } from '../../utils/api';
import toast from 'react-hot-toast';
import { useGetAsset } from '../hooks/useGetAsset';
import { assetApi } from '../utils/api';
import { editAssetSchema } from '../utils/validation';

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

const EditAssetSlideover = ({
  open,
  setOpen,
  assetId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  assetId: string;
}) => {
  const { data: asset, isLoading: loadingAsset } = useGetAsset(assetId);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState<Date | undefined>(
    undefined
  );
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [usefulLifeYears, setUsefulLifeYears] = useState('');
  const [salvageValue, setSalvageValue] = useState('');
  const [depreciationMethod, setDepreciationMethod] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  useEffect(() => {
    if (asset) {
      setName(asset.name || '');
      setDescription(asset.description || '');
      setAssetType(asset.asset_type || '');
      setAcquisitionDate(
        asset.acquisition_date ? new Date(asset.acquisition_date) : undefined
      );
      setAcquisitionCost(
        asset.acquisition_cost ? String(asset.acquisition_cost) : ''
      );
      setUsefulLifeYears(
        asset.useful_life_years ? String(asset.useful_life_years) : ''
      );
      setSalvageValue(asset.salvage_value ? String(asset.salvage_value) : '');
      setDepreciationMethod(asset.depreciation_method || '');
      setLocation(asset.location || '');
      setStatus(asset.status || '');
      setSerialNumber(asset.serial_number || '');
    }
  }, [asset]);

  const handleAssetUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setLoading(true);
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
    };
    try {
      await editAssetSchema.validate(payload, { abortEarly: false });
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
      await assetApi.update(assetId, payload);
      toast.success('Asset updated successfully!');
      setOpen(false);
    } catch (err) {
      toast.error('Failed to update asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slider
      edit={true}
      title="Edit Asset"
      open={open}
      setOpen={setOpen}
      noPanelScroll={true}
    >
      <div className="max-w-5xl w-full">
        <form className="relative overflow-hidden w-full">
          <div className="grid grid-cols-2 min-h-full gap-4 p-4">
            {/* Left Column */}
            <div className="space-y-4">
              <Input
                label="Asset Name"
                name="name"
                type="text"
                value={name}
                onchange={(e) => setName(e.target.value)}
                required
                errors={formErrors.name}
                placeholder="e.g. Dell Latitude Laptop"
              />
              <Input
                label="Description"
                name="description"
                type="text"
                value={description}
                onchange={(e) => setDescription(e.target.value)}
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
                onchange={(e) => setUsefulLifeYears(e.target.value)}
                required
                min={0}
                errors={formErrors.useful_life_years}
                placeholder="e.g. 5"
              />
            </div>
            {/* Right Column */}
            <div className="space-y-4">
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
              <Input
                label="Location"
                name="location"
                type="text"
                value={location}
                onchange={(e) => setLocation(e.target.value)}
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
                onchange={(e) => setSerialNumber(e.target.value)}
                errors={formErrors.serial_number}
                placeholder="e.g. SN-DL-45678-XC"
              />
            </div>
          </div>
        </form>
        <div className="w-full flex justify-end mt-8">
          <Button
            text="Update Asset"
            type="submit"
            isLoading={loading}
            disabled={loading}
            onClick={handleAssetUpdate}
          />
        </div>
      </div>
    </Slider>
  );
};

export default EditAssetSlideover;
