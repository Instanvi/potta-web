import axios from 'config/axios.config';

export type DocumentSendKind =
  | 'invoice'
  | 'bill'
  | 'purchase_order'
  | 'credit_note'
  | 'estimate'
  | 'sales_order'
  | 'sales_receipt'
  | 'shipment'
  | 'supplier_credit'
  | 'item_receipt'
  | 'proposal'
  | 'contract';

export type DocumentSendChannel = 'email' | 'sms';

export type DocumentSendPayload = {
  channel?: DocumentSendChannel;
  to?: string;
  phone?: string;
  message?: string;
};

export type DocumentSendResult = {
  ok: true;
  to: string;
  channel: DocumentSendChannel;
};

/** Unified send/resend — cancels prior download links. */
export async function sendPartyDocument(
  kind: DocumentSendKind,
  id: string,
  data: DocumentSendPayload = {},
): Promise<DocumentSendResult> {
  const res = await axios.post(`/documents/${kind}/${id}/send`, data);
  return res.data;
}
