const isUrl = (value: unknown): value is string =>
  typeof value === 'string' && /^(https:\/\/|\/(?!\/))/.test(value);

/** Product images are stored on the item as plain URLs (`images: string[]`). */
export const productImageUrls = (product: { images?: unknown } | null | undefined): string[] =>
  Array.isArray(product?.images) ? product!.images.filter(isUrl) : [];

export const productImageUrl = (
  product: { images?: unknown } | null | undefined,
  fallback = '/images/placeholder.png'
) => productImageUrls(product)[0] ?? fallback;
