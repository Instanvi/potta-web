export type Filter = {
  limit: number;
  page: number;
  sortBy?: 'updatedAt' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  productType?: 'INVENTORY' | 'NON_INVENTORY' | 'ASSEMBLY' | 'SIMPLEGROUPS';
  sort?: string;
};

export type ProductLabelOption = {
  uuid: string;
  value: string;
  hexColor?: string | null;
  label?: { uuid: string; name: string };
};

export type ProductVariation = {
  uuid: string;
  name?: string | null;
  sku?: string | null;
  salesPrice: number;
  cost: number;
  inventoryLevel: number;
  reorderPoint?: number;
  active?: boolean;
  payVariationId?: string | null;
  options?: ProductLabelOption[];
};

export type PackagePrice = {
  uuid: string;
  packageName: string;
  unitsPerPackage: number;
  packagePrice: number;
  sku?: string | null;
  productUuid?: string | null;
  variationUuid?: string | null;
  active?: boolean;
};

export type Unit = {
  uuid: string;
  name: string;
  symbol: string;
  factor: number;
  type?: string | null;
  active?: boolean;
};

export type ProductUnitAssignment = {
  uuid: string;
  isDefault?: boolean;
  sortOrder?: number;
  unit: Unit;
};

export type ProductModifier = {
  uuid: string;
  name: string;
  price: number;
  productUuid?: string | null;
  active?: boolean;
  sortOrder?: number;
};

export type InventoryMovement = {
  uuid: string;
  type: string;
  reason: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  unitCost?: number | null;
  createdAt: string;
  variation?: ProductVariation | null;
  notes?: string | null;
};

export type Product = {
  uuid: string;
  createdAt: string;
  createdBy?: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
  updatedAt?: string | null;
  productId: string;
  name: string;
  documents?: { url: string } | null;
  description?: string;
  unitOfMeasure?: string;
  cost: number | string;
  sku?: string;
  inventoryLevel: number;
  stockTotal?: number;
  salesPrice: number | string;
  regularPrice?: number | null;
  margin?: number | null;
  taxRate?: number | null;
  currency?: string;
  taxable: boolean;
  category: string | { uuid?: string; name: string } | null;
  tax?: { uuid?: string; name: string; rate: number | string; type?: string } | null;
  images: string[] | null;
  status: string;
  type?: 'INVENTORY' | 'NON_INVENTORY' | null;
  structure?: 'SIMPLE' | 'ASSEMBLY' | 'SIMPLEGROUPS' | null;
  reorderPoint?: number;
  hasVariations?: boolean;
  hasModifiers?: boolean;
  costMethod?: string;
  components?: ProductComponent[];
  componentLinks?: { componentId: string; quantity: number; component?: Product }[];
  variations?: ProductVariation[];
  unitAssignments?: ProductUnitAssignment[];
  packagePrices?: PackagePrice[];
  variationPackagePrices?: PackagePrice[];
  modifiers?: ProductModifier[];
  orgModifiers?: ProductModifier[];
  payProductId?: string | null;
  lastSynced?: string | null;
};

export type ProductComponent = {
  productId: string;
  quantity: number;
  product?: Product;
};

export type ProductResponse = {
  data: Product[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
};

export type ProductCategory = {
  uuid: string;
  name: string;
  description: string;
  /** Count of products in this category (from list API). */
  productCount?: number;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  branchId: string;
};

export type ProductCategoryResponse = {
  data: ProductCategory[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
};

export function lineKey(parts: {
  productId: string;
  variationId?: string | null;
  packagePriceId?: string | null;
  unitId?: string | null;
  modifierIds?: string[];
}) {
  const mods = [...(parts.modifierIds ?? [])].sort().join(',');
  return [parts.productId, parts.variationId || '', parts.packagePriceId || '', parts.unitId || '', mods].join('|');
}
