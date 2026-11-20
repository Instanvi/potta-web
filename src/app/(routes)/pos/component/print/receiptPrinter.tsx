import React from 'react';
import moment from 'moment';
import { useAuthContextStore } from '@/store/use-auth-context-store';

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

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const money = (n: number | undefined) => `${Number(n ?? 0).toFixed(2)} XAF`;

const row = (label: string, value: string) =>
  `<tr><td><p class="font-normal prints">${escapeHtml(label)}</p></td><td class="text-right"><p class="font-normal prints">${escapeHtml(value)}</p></td></tr>`;

export class ReceiptPrinter {
  private iframeRef = React.createRef<HTMLIFrameElement>();

  private generatePrintContent(orderData: OrderData): string {
    const organization = useAuthContextStore.getState().organization as { name?: string } | null;
    const shopName = organization?.name || 'Potta POS';
    return `
      <div class="flex prints w-full print justify-center">
        <div class="w-full">
          <p class="prints text-center text-xl font-medium">${escapeHtml(shopName)}</p>
          <p class="prints font-normal text-center text-xl">----------------</p>
          <div class="w-full justify-center mt-5">
            <table class="w-full">
              ${row('Receipt', String(orderData.orderNumber))}
              ${orderData.orderItems.map((item) => row(`${item.quantity} x ${item.name}`, (item.price * item.quantity).toFixed(2))).join('')}
              ${row('Items', String(orderData.orderItems.reduce((s, i) => s + Number(i.quantity), 0)))}
              ${orderData.discount ? row('Discount', `-${money(orderData.discount)}`) : ''}
              ${orderData.tax ? row('VAT', money(orderData.tax)) : ''}
              ${row('Total', money(orderData.total))}
              ${row(orderData.paymentLabel ?? 'Cash', money(orderData.cashAmount))}
              ${row('Change', money(orderData.change))}
            </table>
          </div>
          <p class="font-normal text-center my-2 prints">${moment(orderData.timestamp).format('MMM Do YYYY, h:mm:ss a')}</p>
          <p class="font-normal text-center my-2 prints">Thank you for your purchase</p>
        </div>
      </div>
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
        doc.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />');
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
