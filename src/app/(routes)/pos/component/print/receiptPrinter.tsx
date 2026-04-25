import React, { useRef } from 'react';
import moment from 'moment';
import { toast } from 'sonner';

interface OrderItem {
  quantity: number;
  name: string;
  price: number;
}

interface OrderData {
  orderNumber: number;
  orderItems: OrderItem[];
  total: number;
  cashAmount: number;
  change: number;
  timestamp: string;
}

interface ReceiptPrinterProps {
  onPrintSuccess?: () => void;
}

export class ReceiptPrinter {
  private iframeRef: React.RefObject<HTMLIFrameElement>;

  constructor() {
    this.iframeRef = React.createRef<HTMLIFrameElement>();
  }

  private generatePrintContent(orderData: OrderData): string {
    return `
      <div class="flex prints w-full print justify-center">
        <div class="w-full">
          <center>
            <img src="/icons/logo.svg" class="h-16 text-center w-auto" alt="" />
          </center>
          <p class="prints text-center text-xl font-medium">Food Rep</p>
          <p class="prints font-normal text-center">Douala - Cameroon</p>
          <p class="prints font-normal text-center">Monday - Sunday</p>
          <p class="prints font-normal text-center">From 08H00 - 22H00</p>
          <p class="prints font-normal text-center text-xl">----------------</p>
          <div class="w-full justify-center mt-5">
            <table class="w-full">
              <tr>
                <td><p class="font-normal prints">Bill Number</p></td>
                <td class="text-right"><p class="font-normal prints">${
                  orderData.orderNumber
                }</p></td>
              </tr>
              ${orderData.orderItems
                .map(
                  (item) => `
                <tr>
                  <td><p class="font-normal prints">${item.quantity} x ${
                    item.name
                  }</p></td>
                  <td class="text-right"><p class="font-normal prints">${
                    item.price * item.quantity
                  }</p></td>
                </tr>
              `
                )
                .join('')}
              <tr>
                <td><p class="font-normal prints">Qty</p></td>
                <td class="text-right"><p class="font-normal prints">${
                  orderData.orderItems.length
                }</p></td>
              </tr>
              <tr>
                <td><p class="font-normal prints">Total Price:</p></td>
                <td class="text-right"><p class="font-normal prints">${orderData.total.toFixed(
                  2
                )} XAF</p></td>
              </tr>
              <tr>
                <td><p class="font-normal prints">Cash Amount:</p></td>
                <td class="text-right"><p class="font-normal prints">${orderData.cashAmount.toFixed(
                  2
                )} XAF</p></td>
              </tr>
              <tr>
                <td><p class="font-normal prints">Change:</p></td>
                <td class="text-right"><p class="font-normal prints">${orderData.change.toFixed(
                  2
                )} XAF</p></td>
              </tr>
            </table>
          </div>
          <p class="font-normal text-center my-2 prints">${moment(
            orderData.timestamp
          ).format('MM Do YYYY, h:mm:ss a')}</p>
          <p class="font-normal text-center my-2 prints">Thank you for your fidelity</p>
          <div class="w-full flex justify-center relative">
            <svg id="barcode"></svg>
          </div>
        </div>
      </div>
    `;
  }

  public getIframeElement(): JSX.Element {
    return (
      <iframe
        ref={this.iframeRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    );
  }

  public async printReceipt(orderData: OrderData): Promise<void> {
    return new Promise((resolve, reject) => {
      const iframe = this.iframeRef.current;
      if (!iframe) {
        reject(new Error('Iframe not found'));
        return;
      }

      try {
        const doc = iframe.contentWindow!.document;
        doc.open();
        doc.write('<html><head><title>Print</title>');
        doc.write(
          '<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />'
        );
        doc.write('</head><body>');
        doc.write(this.generatePrintContent(orderData));
        doc.write('</body></html>');
        doc.close();

        // Wait for resources to load
        setTimeout(() => {
          iframe.contentWindow!.focus();
          iframe.contentWindow!.print();

          // Show success toast after printing
          toast.success('Receipt printed successfully', {
            description: `Order #${orderData.orderNumber} has been printed`,
            duration: 5000,
          });

          resolve();
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  }
}
