import type { PackagePrice, Product, ProductModifier, ProductVariation, Unit } from '@potta/app/(routes)/pos/inventory/_utils/types';

export function priceCatalogSelection(params: {
  product: Product;
  variation?: ProductVariation | null;
  packagePrice?: PackagePrice | null;
  unit?: Unit | null;
  modifiers?: ProductModifier[];
}) {
  let unitPrice = params.variation
    ? Number(params.variation.salesPrice)
    : Number(params.product.salesPrice);
  let unitsPerPackage = 1;
  if (params.packagePrice) {
    unitPrice = Number(params.packagePrice.packagePrice);
    unitsPerPackage = Number(params.packagePrice.unitsPerPackage) || 1;
  }
  const factor = params.unit ? Number(params.unit.factor) || 1 : 1;
  unitPrice *= factor;
  const modifierTotal = (params.modifiers ?? []).reduce((s, m) => s + Number(m.price), 0);
  unitPrice += modifierTotal;
  return { unitPrice, unitsPerPackage, factor, modifierTotal };
}
