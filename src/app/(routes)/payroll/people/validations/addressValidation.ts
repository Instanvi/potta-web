import * as yup from 'yup';

export const addressValidationSchema = yup.object().shape({
  address: yup
    .string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address cannot exceed 200 characters'),

  city: yup
    .string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City cannot exceed 50 characters'),

  state: yup
    .string()
    .required('State is required')
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State cannot exceed 50 characters'),

  country: yup
    .string()
    .required('Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country cannot exceed 50 characters'),

  postalCode: yup
    .string()
    .required('Postal code is required')
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code cannot exceed 20 characters'),

  latitude: yup
    .number()
    .optional()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: yup
    .number()
    .optional()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

  countryName: yup.string().optional(),

  stateName: yup.string().optional(),
});

export type AddressFormData = yup.InferType<typeof addressValidationSchema>;
