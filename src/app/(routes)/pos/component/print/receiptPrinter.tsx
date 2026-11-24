import React from 'react';
import moment from 'moment';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { absoluteBrandUrl, orgLogoOrPotta } from '@/lib/brand';

interface OrderItem {
  quantity: number;
  name: string;
  price: number;
}

export interface OrderData {
  orderNumber: string | number;
  orderItems: OrderItem[];
  total: number;
  tax?: number;
  discount?: number;
  cashAmount: number;
  change: number;
  paymentLabel?: string;
  timestamp: string;
}

/** POS receipt layouts tuned for common paper widths. */
export type ReceiptPrinterFormat = 'thermal-58' | 'thermal-80' | 'a4';

const FORMAT_META: Record<
  ReceiptPrinterFormat,
  { label: string; pageWidth: string; fontPx: number; maxWidth: string }
> = {
  'thermal-58': { label: '58mm thermal', pageWidth: '58mm', fontPx: 11, maxWidth: '52mm' },
  'thermal-80': { label: '80mm thermal', pageWidth: '80mm', fontPx: 12, maxWidth: '72mm' },
  a4: { label: 'A4 / letter', pageWidth: '210mm', fontPx: 13, maxWidth: '180mm' },
};

const STORAGE_KEY = 'potta.pos.receiptPrinterFormat';

export function readReceiptPrinterFormat(): ReceiptPrinterFormat {
  if (typeof window === 'undefined') return 'thermal-80';
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'thermal-58' || raw === 'thermal-80' || raw === 'a4') return raw;
  return 'thermal-80';
}

export function writeReceiptPrinterFormat(format: ReceiptPrinterFormat) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, format);
}

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const money = (n: number | undefined) => `${Number(n ?? 0).toFixed(2)} XAF`;

const row = (label: string, value: string, compact: boolean) =>
  `<tr>
    <td style="padding:${compact ? '2px 0' : '4px 0'};vertical-align:top"><span>${escapeHtml(label)}</span></td>
    <td style="padding:${compact ? '2px 0' : '4px 0'};text-align:right;white-space:nowrap"><span>${escapeHtml(value)}</span></td>
  </tr>`;

export class ReceiptPrinter {
  private iframeRef = React.createRef<HTMLIFrameElement>();
  private format: ReceiptPrinterFormat;

  constructor(format?: ReceiptPrinterFormat) {
    this.format = format ?? (typeof window !== 'undefined' ? readReceiptPrinterFormat() : 'thermal-80');
  }

  setFormat(format: ReceiptPrinterFormat) {
    this.format = format;
    writeReceiptPrinterFormat(format);
  }

  getFormat() {
    return this.format;
  }

  private generatePrintContent(orderData: OrderData): string {
    const organization = useAuthContextStore.getState().organization as {
      name?: string;
      logo?: string | null;
      businessName?: string;
    } | null;
    const shopName = organization?.businessName || organization?.name || 'Potta POS';
    const logoSrc = absoluteBrandUrl(orgLogoOrPotta(organization?.logo, 'png'));
    const meta = FORMAT_META[this.format];
    const compact = this.format !== 'a4';
    const divider = compact ? '----------------' : '————————————————';

    return `
      <div class="receipt" data-format="${this.format}">
        <div class="inner">
          <div class="brand">
            <img src="${escapeHtml(logoSrc)}" alt="" class="logo" />
            <p class="shop">${escapeHtml(shopName)}</p>
          </div>
          <p class="muted center">${escapeHtml(meta.label)}</p>
          <p class="divider center">${divider}</p>
          <table class="lines">
            ${row('Receipt', String(orderData.orderNumber), compact)}
            ${orderData.orderItems
              .map((item) =>
                row(
                  `${item.quantity} × ${item.name}`,
                  (item.price * item.quantity).toFixed(2),
                  compact,
                ),
              )
              .join('')}
            ${row(
              'Items',
              String(orderData.orderItems.reduce((s, i) => s + Number(i.quantity), 0)),
              compact,
            )}
            ${orderData.discount ? row('Discount', `-${money(orderData.discount)}`, compact) : ''}
            ${orderData.tax ? row('VAT', money(orderData.tax), compact) : ''}
            ${row('Total', money(orderData.total), compact)}
            ${row(orderData.paymentLabel ?? 'Cash', money(orderData.cashAmount), compact)}
            ${row('Change', money(orderData.change), compact)}
          </table>
          <p class="divider center">${divider}</p>
          <p class="muted center">${moment(orderData.timestamp).format('MMM Do YYYY, h:mm:ss a')}</p>
          <p class="thanks center">Thank you for your purchase</p>
        </div>
      </div>
    `;
  }

  private printStyles(): string {
    const meta = FORMAT_META[this.format];
    return `
      <style>
        @page { size: ${meta.pageWidth} auto; margin: 4mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: ${meta.fontPx}px;
          color: #111;
          background: #fff;
        }
        .receipt { width: 100%; display: flex; justify-content: center; }
        .inner { width: 100%; max-width: ${meta.maxWidth}; }
        .brand { text-align: center; margin-bottom: 6px; }
        .logo {
          display: inline-block;
          width: ${this.format === 'thermal-58' ? '36px' : this.format === 'a4' ? '64px' : '48px'};
          height: auto;
          object-fit: contain;
          margin-bottom: 4px;
        }
        .shop { margin: 0; font-weight: 600; font-size: ${this.format === 'a4' ? '18px' : '14px'}; }
        .center { text-align: center; }
        .muted { color: #555; margin: 2px 0; font-size: ${Math.max(meta.fontPx - 1, 10)}px; }
        .divider { margin: 6px 0; letter-spacing: 1px; }
        .lines { width: 100%; border-collapse: collapse; }
        .thanks { margin-top: 8px; font-weight: 600; }
        ${
          this.format === 'a4'
            ? `.inner { padding: 24px; border: 1px solid #e5e5e5; border-radius: 2px; }
               body { font-family: Inter, system-ui, sans-serif; }`
            : ''
        }
      </style>
    `;
  }

  public getIframeElement(): React.JSX.Element {
    return <iframe ref={this.iframeRef} style={{ display: 'none' }} title="Print Frame" />;
  }

  public async printReceipt(orderData: OrderData): Promise<void> {
    return new Promise((resolve, reject) => {
      const iframe = this.iframeRef.current;
      if (!iframe?.contentWindow) {
        reject(new Error('Print frame not ready'));
        return;
      }
      try {
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write('<html><head><title>Receipt</title>');
        doc.write(this.printStyles());
        doc.write('</head><body>');
        doc.write(this.generatePrintContent(orderData));
        doc.write('</body></html>');
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve();
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  }
}
