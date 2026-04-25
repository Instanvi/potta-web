import * as yup from "yup";

const addressSchema = yup.object().shape({
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string(),
  country: yup.string().required("Country is required"),
  postalCode: yup.string(),
  latitude: yup.number().typeError("Must be a number"),
  longitude: yup.number().typeError("Must be a number")


})
const CustomerStatusEnum = [ 'pending', 'schedule', 'complete', 'enabled', 'disabled', 'available', 'expired', 'taken' ] as const
const CustomerTypeEnum = ["INDIVIDUAL", "COMPANY",] as const;
const CustomerGenderEnum = ["male", "female","others"]
const phoneNumberRegex = /^\+\d{1,4}\s?\d{6,14}$/

export const customerSchema = yup.object().shape({
  firstName: yup.string().required("Vendor name is required"),
  lastName: yup.string().required("Vendor name is required"),
  type: yup.string().oneOf([...CustomerTypeEnum], "Invalid type").required("Type is required"),
  contactPerson: yup.string(),
  email: yup.string().email("Invalid email"),
  phone: yup.string().required("Phone number is required").matches(phoneNumberRegex, "Invalid phone number. Example: +237689393939"),
  address: addressSchema,
  taxId: yup.string(),
  gender: yup.string().oneOf([...CustomerGenderEnum], "Invalid Gender").required("Gender is required"),
  creditLimit: yup.number(),
  date_of_birth: yup.date().typeError("Invalid date").required("Date of birth is required"),


})

export const updateCustomerSchema = yup.object().shape({
  firstName: yup.string().required("Vendor name is required"),
  lastName: yup.string().required("Vendor name is required"),
  type: yup.string().oneOf([...CustomerTypeEnum], "Invalid type").required("Type is required"),
  contactPerson: yup.string(),
  email: yup.string().email("Invalid email"),
  phone: yup.string().required("Phone number is required").matches(phoneNumberRegex, "Invalid phone number. Example: +237689393939"),
  address: addressSchema,
  taxId: yup.string(),
  gender: yup.string().oneOf([...CustomerGenderEnum], "Invalid Gender").required("Gender is required"),
  creditLimit: yup.number(),
  status: yup.string().oneOf([...CustomerStatusEnum], "Invalid Status").required("Status is required"),
})

export type UpdateCustomerPayload = yup.InferType<typeof updateCustomerSchema>;
export type CustomerPayload = yup.InferType<typeof customerSchema>;
