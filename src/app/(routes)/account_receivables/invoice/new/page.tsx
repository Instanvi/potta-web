'use client';
import React, { useCallback, useState, useContext, Suspense } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import { useSearchParams } from 'next/navigation';

import FileExtractDropzone from '@potta/components/FileExtractDropzone';
import { ContextData } from '@potta/components/providers/DataProvider';
import { extractInvoiceFromFile } from './api/extractInvoice';
import DocumentWorkspace from '@potta/components/document-workspace';
import { DocumentPreviewDialog } from '@potta/components/document-preview-dialog';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { Skeleton } from '@potta/components/ui/loaders';

const NewInvoiceInner = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState<(() => Promise<void>) | null>(
    null,
  );
  const registerDownload = useCallback((fn: () => Promise<void>) => {
    setDownloadPdf(() => fn);
  }, []);
  const searchParams = useSearchParams();
  const initialInvoiceType = searchParams.get('type');
  const [extracting, setExtracting] = useState(false);
  const context = useContext(ContextData);

  const extractInvoiceData = async (file: File) => {
    setExtracting(true);
    try {
      const data = await extractInvoiceFromFile(file);
      if (context && context.setData) {
        context.setData((prev: any) => ({
          ...prev,
          data: {
            ...prev.data,
            ...data,
          },
        }));
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setExtracting(false);
    }
  };

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  return (
    <DocumentWorkspace
      title="New invoice"
      closeHref="/account_receivables/invoice"
      headerActions={
        <>
          <LocationSwitcher />
          <button
            type="button"
            onClick={openPreview}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[2px] border border-black/10 bg-white px-3 text-sm text-foreground hover:bg-accent"
          >
            <i className="ri-eye-line" />
            Preview
          </button>
        </>
      }
    >
      <FileExtractDropzone onExtract={extractInvoiceData} extracting={extracting}>
        <div className="flex h-full min-h-0 flex-col bg-white">
          <div className="h-full min-h-0 overflow-y-auto bg-white">
            <Left
              initialInvoiceType={initialInvoiceType}
              onOpenPreview={openPreview}
            />
          </div>
        </div>
      </FileExtractDropzone>

      <DocumentPreviewDialog
        open={showPreview}
        onOpenChange={(open) => !open && closePreview()}
        downloadTitle="Invoice"
        dialogTitle="Invoice preview"
        onDownloadPdf={downloadPdf ?? undefined}
      >
        <PdfView onRegisterDownload={registerDownload} />
      </DocumentPreviewDialog>
    </DocumentWorkspace>
  );
};

const NewInvoice = () => (
  <Suspense
    fallback={
      <div className="fixed inset-0 z-[100] flex flex-col bg-main-bg p-6" aria-busy="true">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-3 h-10 w-full max-w-md" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    }
  >
    <NewInvoiceInner />
  </Suspense>
);

export default NewInvoice;
