/** UI-only fields that the voucher create API rejects. */
const UI_ONLY_KEYS = new Set([
  'valueType',
  'advancedCodeSettings',
  'voucherType',
  'loyaltyPointsValue',
]);

function toNumber(value: unknown): number | undefined {
  if (value === '' || value == null) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>;
}

/**
 * Turn the new-voucher form into the CreateVoucherDto body.
 * Drops UI toggles and coerces numbers so Nest validation accepts the payload.
 */
export function buildCreateVoucherPayload(form: Record<string, any>) {
  const type = form.type as string;
  const valueType = (form.valueType as string) || 'fixed';
  const useAdvanced = Boolean(form.advancedCodeSettings);

  const scheduling = form.scheduling
    ? cleanObject({
        programStartDate: form.scheduling.programStartDate || undefined,
        programEndDate: form.scheduling.neverEnds
          ? undefined
          : form.scheduling.programEndDate || undefined,
        neverEnds: Boolean(form.scheduling.neverEnds),
        specificDaysOnly: Boolean(form.scheduling.specificDaysOnly),
        validDays:
          form.scheduling.specificDaysOnly && Array.isArray(form.scheduling.validDays)
            ? form.scheduling.validDays
            : undefined,
      })
    : undefined;

  const audience = cleanObject({
    segment: form.audience?.segment || form.audienceSegment || undefined,
    autoAddUsers: Boolean(form.autoAddUsers ?? form.audience?.autoAddUsers),
    canJoinOnce: Boolean(form.canJoinOnce ?? form.audience?.canJoinOnce),
    programCardPrefix: form.programCardPrefix || form.audience?.programCardPrefix || undefined,
  });

  const payload: Record<string, unknown> = {
    type,
    programCardPrefix: form.programCardPrefix || undefined,
    usageLimit: toNumber(form.usageLimit),
    minimumPurchase: toNumber(form.minimumPurchase),
    autoAddUsers: Boolean(form.autoAddUsers),
    canJoinOnce: Boolean(form.canJoinOnce),
    audience: Object.keys(audience).length ? audience : undefined,
    scheduling: scheduling && Object.keys(scheduling).length ? scheduling : undefined,
  };

  if (useAdvanced && form.codeSettings) {
    payload.codeSettings = cleanObject({
      prefix: form.codeSettings.prefix || undefined,
      postfix: form.codeSettings.postfix || undefined,
      length: toNumber(form.codeSettings.length),
      pattern: form.codeSettings.pattern || undefined,
      characterSet: form.codeSettings.characterSet || undefined,
    });
  } else if (form.code) {
    payload.code = String(form.code);
  }

  if (type === 'DISCOUNT') {
    if (valueType === 'proportional') {
      payload.discountPercent = toNumber(form.discountPercent);
    } else {
      payload.discountAmount = toNumber(form.discountAmount);
    }
    const max = toNumber(form.maximumDiscount);
    if (max != null) payload.maximumDiscount = max;
  }

  if (type === 'GIFT_CARD') {
    payload.balance = toNumber(form.balance);
  }

  if (type === 'CASHBACK') {
    payload.cashbackPercent = toNumber(form.cashbackPercent);
    payload.cashbackMaximum = toNumber(form.cashbackMaximum);
    const amount = toNumber(form.cashbackAmount);
    if (amount != null) payload.cashbackAmount = amount;
  }

  if (type === 'ROYALTY_POINTS') {
    payload.loyaltyPoints = toNumber(form.loyaltyPoints);
    const amount = toNumber(form.loyaltyAmount);
    if (amount != null) payload.loyaltyAmount = amount;
  }

  // Drop anything that slipped through from the raw form.
  for (const key of UI_ONLY_KEYS) delete payload[key];

  return cleanObject(payload);
}
