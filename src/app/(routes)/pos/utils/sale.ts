/**
 * POS sale helpers shared by the till (/pos) and the manual receipt form (/pos/sales/new).
 * Enum values and pricing mirror potta-backend SaleReceiptService: line discount first,
 * then VAT on the discounted line, then the sale-level (coupon) discount.
 */

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CREDIT_CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT', label: 'On account (credit)' },
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value'] | 'OTHER' | 'DIGITAL_WALLET';
export const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map((m) => m.value) as PaymentMethod[];

export const DISCOUNT_TYPES = ['PERCENTAGE', 'FLAT_RATE', 'PERCENTAGE_WITH_CAP'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type SaleLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  /** VAT % (from the product's tax); the backend re-derives it from the product. */
  taxRate: number;
  discountType: DiscountType;
  /** PERCENTAGE: % of the line. FLAT_RATE: amount per unit. */
  discountRate: number;
  discountCap: number;
  productId: string;
};

export type SaleTender = { paymentMethod: PaymentMethod; amount: number; reference?: string };

export type SalePayload = {
  saleDate: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  payments?: SaleTender[];
  discountAmount?: number;
  customerId?: string;
  receiptNumber?: string;
  paymentReference?: string;
  notes?: string;
  lineItems: SaleLineItem[];
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineDiscount(item: Pick<SaleLineItem, 'quantity' | 'unitPrice' | 'discountType' | 'discountRate' | 'discountCap'>) {
  const gross = Number(item.unitPrice) * Number(item.quantity);
  const rate = Number(item.discountRate || 0);
  if (!(rate > 0)) return 0;
  let discount = item.discountType === 'FLAT_RATE' ? rate * Number(item.quantity) : (gross * rate) / 100;
  if (item.discountType !== 'FLAT_RATE' && Number(item.discountCap) > 0) discount = Math.min(discount, Number(item.discountCap));
  return round2(Math.min(discount, gross));
}

export function computeLine(item: SaleLineItem) {
  const gross = round2(Number(item.unitPrice) * Number(item.quantity));
  const discount = lineDiscount(item);
  const net = round2(gross - discount);
  const tax = round2((net * Number(item.taxRate || 0)) / 100);
  return { gross, discount, net, tax, total: round2(net + tax) };
}

export function computeTotals(items: SaleLineItem[], orderDiscount = 0) {
  const lines = items.map(computeLine);
  const subtotal = round2(lines.reduce((s, l) => s + l.gross, 0));
  const itemDiscounts = round2(lines.reduce((s, l) => s + l.discount, 0));
  const tax = round2(lines.reduce((s, l) => s + l.tax, 0));
  const beforeCoupon = round2(subtotal - itemDiscounts + tax);
  const discount = round2(Math.min(Math.max(orderDiscount, 0), beforeCoupon));
  return { subtotal, itemDiscounts, tax, discount, total: round2(beforeCoupon - discount) };
}

/** Product -> cart line. Tax comes from the product's tax relation (`product.tax.rate`). */
export function productToLine(product: {
  uuid: string;
  name: string;
  salesPrice: number | string;
  tax?: { rate?: number | string; type?: string } | null;
  taxable?: boolean | null;
}): SaleLineItem {
  return {
    description: product.name,
    quantity: 1,
    unitPrice: Number(product.salesPrice),
    taxRate: productTaxRate(product),
    discountType: 'PERCENTAGE',
    discountRate: 0,
    discountCap: 0,
    productId: product.uuid,
  };
}

export function productTaxRate(product: { tax?: { rate?: number | string; type?: string } | null; taxable?: boolean | null }) {
  if (product.tax && product.tax.type !== 'FIXED') return Number(product.tax.rate ?? 0);
  return 0;
}

/** Only stock items (type INVENTORY) are limited by the shelf quantity. */
export function isStockTracked(product: { type?: string | null }) {
  return product.type === 'INVENTORY';
}

export function buildSalePayload(input: {
  items: SaleLineItem[];
  orderDiscount?: number;
  paymentMethod: PaymentMethod;
  payments?: SaleTender[];
  customerId?: string | null;
  reference?: string;
  notes?: string;
  receiptNumber?: string;
  saleDate?: string;
}): SalePayload {
  const totals = computeTotals(input.items, input.orderDiscount ?? 0);
  return {
    saleDate: input.saleDate ?? new Date().toISOString(),
    totalAmount: totals.total,
    paymentMethod: input.paymentMethod,
    ...(input.payments?.length ? { payments: input.payments } : {}),
    discountAmount: totals.discount,
    ...(input.customerId ? { customerId: input.customerId } : {}),
    ...(input.receiptNumber ? { receiptNumber: input.receiptNumber } : {}),
    ...(input.reference ? { paymentReference: input.reference } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    lineItems: input.items.map((i) => ({
      description: i.description,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      taxRate: Number(i.taxRate || 0),
      discountType: i.discountType,
      discountRate: Number(i.discountRate || 0),
      discountCap: Number(i.discountCap || 0),
      productId: i.productId,
    })),
  };
}

/** Backend validation messages come back as `message: string | string[]`. */
export function apiErrorMessage(error: any, fallback = 'Something went wrong') {
  const message = error?.response?.data?.message ?? error?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message || fallback;
}
