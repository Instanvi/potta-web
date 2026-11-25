'use client';
import React, { useState, useContext, useEffect, useRef } from 'react';
import Slider from '@potta/components/slideover';
import { ContextData } from '@potta/components/providers/DataProvider';
import Left from '../new/components/left';
import PdfView from '../new/components/pdfview';
import FileExtractDropzone from '@potta/components/FileExtractDropzone';
import { DocumentPreviewDialog } from '@potta/components/document-preview-dialog';
import { toast } from 'sonner';

interface LineItem {
  uuid: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountRate: number | null;
  discountAmount: number | null;
  discountType: string;
  discountCap: number;
}

interface Invoice {
  uuid: string;
  invoiceId: string;
  invoiceNumber?: string | null;
  code?: string;
  issuedDate: string;
  dueDate: string;
  invoiceType: string;
  invoiceTotal: number;
  status: string;
  notes: string;
  currency: string;
  taxRate: number | null;
  taxAmount: number | null;
  paymentMethod: string;
  billingAddress: string;
  shippingAddress: string | null;
  paymentTerms: string | null;
  paymentReference: string | null;
  lineItems: LineItem[];
  rfqId?: string | null;
  spendRequestId?: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
}

interface EditInvoiceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  invoice: Invoice | null;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  open,
  setOpen,
  invoice,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const context = useContext(ContextData);
  const hasPopulatedContext = useRef(false);

  useEffect(() => {
    if (open && invoice && context && !hasPopulatedContext.current) {
      const invoiceData = {
        invoiceType: invoice.invoiceType,
        currency: invoice.currency,
        issueDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        invoiceNumber: invoice.invoiceNumber || invoice.invoiceId,
        billingAddress: invoice.billingAddress,
        shippingAddress: invoice.shippingAddress,
        paymentMethod: invoice.paymentMethod,
        paymentTerms: invoice.paymentTerms,
        paymentReference: invoice.paymentReference,
        taxRate: invoice.taxRate,
        notes: invoice.notes,
        table: invoice.lineItems.map((item, index) => ({
          id: index + 1,
          uuid: item.uuid,
          name: item.description,
          qty: item.quantity,
          price: item.unitPrice,
          tax: item.taxRate,
          productId: item.uuid,
        })),
      };

      context.setData((prev: any) => ({
        ...prev,
        ...invoiceData,
      }));

      hasPopulatedContext.current = true;
    }
  }, [open, invoice, context]);

  useEffect(() => {
    if (!open) {
      hasPopulatedContext.current = false;
      setShowPreview(false);
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setShowPreview(false);
  };

  const extractInvoiceData = async (file: File) => {
    setExtracting(true);
    try {
      console.log('File extraction in edit mode:', file);
      toast.success('File extracted successfully!');
    } catch (err) {
      console.error('Extraction error:', err);
      toast.error('Failed to extract file');
    } finally {
      setExtracting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Slider
      edit={true}
      title={`Edit Invoice - ${invoice.invoiceId}`}
      open={open}
      setOpen={setOpen}
    >
      <FileExtractDropzone
        onExtract={extractInvoiceData}
        extracting={extracting}
      >
        <div className="relative max-h-[92.7vh] overflow-y-auto bg-main-bg py-4">
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 rounded-[2px] bg-primary px-4 py-2 text-sm text-white hover:bg-brand-hover"
            >
              <i className="ri-eye-line" />
              Preview
            </button>
          </div>
          <Left
            isEditMode={true}
            originalInvoice={invoice}
            onSave={handleClose}
            onOpenPreview={() => setShowPreview(true)}
          />
        </div>
      </FileExtractDropzone>

      <DocumentPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        downloadTitle="Invoice"
        dialogTitle="Invoice preview"
      >
        <PdfView />
      </DocumentPreviewDialog>
    </Slider>
  );
};

export default EditInvoiceModal;
