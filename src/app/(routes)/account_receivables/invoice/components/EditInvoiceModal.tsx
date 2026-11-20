'use client';
import React, { useState, useContext, useEffect, useRef } from 'react';
import Slider from '@potta/components/slideover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import { ContextData } from '@potta/components/providers/DataProvider';
import Left from '../new/components/left';
import PdfView from '../new/components/pdfview';
import FileExtractDropzone from '@potta/components/FileExtractDropzone';
import toast from 'react-hot-toast';

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
  const [leftPanelSize, setLeftPanelSize] = useState(100);
  const [extracting, setExtracting] = useState(false);
  const context = useContext(ContextData);
  const hasPopulatedContext = useRef(false);

  // Populate context with invoice data when modal opens
  useEffect(() => {
    if (open && invoice && context && !hasPopulatedContext.current) {
      // Convert invoice data to the format expected by the left component
      const invoiceData = {
        // Basic information
        invoiceType: invoice.invoiceType,
        currency: invoice.currency,
        issueDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        invoiceNumber: invoice.invoiceNumber || invoice.invoiceId,

        // Addresses
        billingAddress: invoice.billingAddress,
        shippingAddress: invoice.shippingAddress,

        // Payment information
        paymentMethod: invoice.paymentMethod,
        paymentTerms: invoice.paymentTerms,
        paymentReference: invoice.paymentReference,
        taxRate: invoice.taxRate,

        // Notes
        notes: invoice.notes,

        // Line items - convert to the format expected by the table
        table: invoice.lineItems.map((item, index) => ({
          id: index + 1,
          uuid: item.uuid,
          name: item.description,
          qty: item.quantity,
          price: item.unitPrice,
          tax: item.taxRate,
          productId: item.uuid, // Use uuid as productId
        })),
      };

      // Update context with invoice data
      context.setData((prev: any) => ({
        ...prev,
        ...invoiceData,
      }));

      console.log('Populated context with invoice data:', invoiceData);
      hasPopulatedContext.current = true;
    }
  }, [open, invoice]); // Remove context from dependencies to prevent infinite loop

  // Reset the ref when modal closes
  useEffect(() => {
    if (!open) {
      hasPopulatedContext.current = false;
    }
  }, [open]);

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Handle panel layout changes
  const handleLayout = (sizes: number[]) => {
    // Store the left panel size
    if (sizes && sizes.length > 0) {
      setLeftPanelSize(sizes[0]);

      // If the left panel is almost full width and preview is showing,
      // automatically hide the preview
      if (sizes[0] > 95 && showPreview) {
        setShowPreview(false);
      }
    }
  };

  // Determine if the preview button should be shown
  const shouldShowPreviewButton = !showPreview || leftPanelSize > 95;

  const handleClose = () => {
    setOpen(false);
    setShowPreview(false);
    setLeftPanelSize(100);
  };

  // Extraction handler (for edit mode, we might not need this but keeping for consistency)
  const extractInvoiceData = async (file: File) => {
    setExtracting(true);
    try {
      // In edit mode, we might want to handle file extraction differently
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
        <div className="max-h-[92.7vh] ">
          {/* Preview toggle button with fade transition */}
          <div
            className={`absolute top-4 right-4 z-10 transition-opacity duration-300 ease-in-out ${
              shouldShowPreviewButton
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={togglePreview}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center"
            >
              <i
                className={`${
                  showPreview ? 'ri-eye-off-line' : 'ri-eye-line'
                } mr-2`}
              ></i>
              {showPreview ? 'Hide Preview' : 'Showss Preview'}
            </button>
          </div>

          {/* Use a wrapper div with transition for the entire panel group */}
          <div className="transition-all duration-300 ease-in-out">
            <ResizablePanelGroup direction="horizontal" onLayout={handleLayout}>
              <ResizablePanel
                minSize={50}
                defaultSize={showPreview ? 50 : 100}
                style={{ transition: 'flex-basis 300ms ease-in-out' }}
              >
                <div
                  className={`py- ${
                    !showPreview ? 'px-8' : 'px-5'
                  } pr-0 h-[92.7vh] overflow-y-auto flex justify-center`}
                >
                  <Left
                    isEditMode={true}
                    originalInvoice={invoice}
                    onSave={handleClose}
                  />
                </div>
              </ResizablePanel>

              {/* Always render the right panel but control its width with CSS */}
              <ResizableHandle
                withHandle
                className={`transition-opacity duration-200 ease-in-out ${
                  showPreview ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <ResizablePanel
                minSize={0}
                defaultSize={showPreview ? 50 : 0}
                style={{
                  transition:
                    'flex-basis 300ms ease-in-out, opacity 300ms ease-in-out',
                  flexBasis: showPreview ? '50%' : '0%',
                  opacity: showPreview ? 1 : 0,
                }}
              >
                <div className="h-[92.7vh] overflow-y-auto bg-[#F2F2F2]">
                  {/* Only render PdfView when preview is showing for performance */}
                  {showPreview && <PdfView />}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </FileExtractDropzone>
    </Slider>
  );
};

export default EditInvoiceModal;
