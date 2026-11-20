import * as yup from 'yup';

export const productSchema = yup.object().shape({
  name: yup.string().required('name is required'),
  description: yup.string(),
  unitOfMeasure: yup.string(),
  cost: yup.number().required('cost is required').typeError('Must be a number'),
  sku: yup.string().required('sku is required'),
  inventoryLevel: yup.number(),
  reorderPoint: yup.number(),
  salesPrice: yup.number().required('sales price is required'),
  taxable: yup.boolean().required(),
  categoryId: yup.string(),
  taxId: yup.string(),
  images: yup.array().of(yup.string()).default([]),
  type: yup
    .string()
    .oneOf(['INVENTORY', 'NON_INVENTORY'])
    .required('type is required'),
  structure: yup
    .string()
    .oneOf(['SIMPLE', 'ASSEMBLY', 'SIMPLEGROUPS'])
    .default('SIMPLE'),
  components: yup
    .array()
    .of(
      yup.object().shape({
        productId: yup.string().required('Product ID is required'),
        quantity: yup
          .number()
          .required('Quantity is required')
          .min(1, 'Quantity must be at least 1'),
      })
    )
    .default([]),
});

export const bundleSchema = yup.object().shape({
  name: yup.string().required('name is required'),
  description: yup.string(),
  unitOfMeasure: yup.string(),
  cost: yup.number().required('cost is required').typeError('Must be a number'),
  sku: yup.string().required('sku is required'),
  inventoryLevel: yup.number(),
  salesPrice: yup.number().required('sales price is required'),
  taxable: yup.boolean().required(),
  categoryId: yup.string(),
  images: yup.array().of(yup.string()).default([]),
  type: yup
    .string()
    .oneOf(['INVENTORY', 'NON_INVENTORY'])
    .required('type is required'),
  structure: yup
    .string()
    .oneOf(['SIMPLE', 'ASSEMBLY', 'SIMPLEGROUPS'])
    .default('ASSEMBLY'),
  reorderPoint: yup.number(),
  components: yup
    .array()
    .of(
      yup.object().shape({
        productId: yup.string().required('Product ID is required'),
        quantity: yup
          .number()
          .required('Quantity is required')
          .min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one component is required'),
});

export const UpdateProductSchema = yup.object().shape({
  name: yup.string().required('name is required'),
  description: yup.string(),
  unitOfMeasure: yup.string(),
  cost: yup.number().required('cost is required').typeError('Must be a number'),
  sku: yup.string().required('sku is required'),
  inventoryLevel: yup.number(),
  salesPrice: yup.number().required('sales price is required'),
  taxable: yup.boolean().required(),
  categoryId: yup.string(),
  images: yup.array().of(yup.string()).default([]),
  status: yup.string().required('status is required'),
  type: yup
    .string()
    .oneOf(['INVENTORY', 'NON_INVENTORY'])
    .required('type is required'),
});

export const productCategorySchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().default(''),
});

export type UpdateProductPayload = yup.InferType<typeof UpdateProductSchema>;
export type ProductPayload = yup.InferType<typeof productSchema>;
export type BundlePayload = yup.InferType<typeof bundleSchema>;
export type ProductCategoryPayload = yup.InferType<
  typeof productCategorySchema
>;
