import * as yup from 'yup';

export const createAssetSchema = yup.object().shape({
  name: yup.string().required('Asset name is required'),
  description: yup.string().required('Description is required'),
  asset_type: yup.string().required('Asset type is required'),
  acquisition_date: yup.string().required('Acquisition date is required'),
  acquisition_cost: yup
    .number()
    .typeError('Acquisition cost must be a number')
    .required('Acquisition cost is required')
    .min(0, 'Acquisition cost cannot be negative'),
  useful_life_years: yup
    .number()
    .typeError('Useful life must be a number')
    .required('Useful life is required')
    .min(1, 'Useful life must be at least 1 year'),
  salvage_value: yup
    .number()
    .typeError('Salvage value must be a number')
    .required('Salvage value is required')
    .min(0, 'Salvage value cannot be negative'),
  depreciation_method: yup.string().required('Depreciation method is required'),
  location: yup.string().required('Location is required'),
  status: yup.string().required('Status is required'),
  serial_number: yup.string(),
  vendor_id: yup.string().required('Vendor is required'),
  purchase_invoice_id: yup.string().required('Purchase invoice is required'),
  gl_asset_account_id: yup.string().required('GL Asset Account is required'),
  gl_depreciation_expense_account_id: yup
    .string()
    .required('GL Depreciation Expense Account is required'),
  gl_accum_depreciation_account_id: yup
    .string()
    .required('GL Accum. Depreciation Account is required'),
});

export const editAssetSchema = yup.object().shape({
  name: yup.string().required('Asset name is required'),
  description: yup.string().notRequired(),
  asset_type: yup.string().required('Asset type is required'),
  acquisition_date: yup.string().required('Acquisition date is required'),
  acquisition_cost: yup
    .number()
    .typeError('Acquisition cost must be a number')
    .notRequired()
    .min(0, 'Acquisition cost cannot be negative'),
  useful_life_years: yup
    .number()
    .typeError('Useful life must be a number')
    .notRequired()
    .min(1, 'Useful life must be at least 1 year'),
  salvage_value: yup
    .number()
    .typeError('Salvage value must be a number')
    .notRequired()
    .min(0, 'Salvage value cannot be negative'),
  depreciation_method: yup.string().notRequired(),
  location: yup.string().notRequired(),
  status: yup.string().notRequired(),
  serial_number: yup.string().notRequired(),
});
