'use client';
import React, { useState, useContext, Suspense } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import { useSearchParams } from 'next/navigation';

import FileExtractDropzone from '@potta/components/FileExtractDropzone';
import { ContextData } from '@potta/components/providers/DataProvider';
import { extractInvoiceFromFile } from './api/extractInvoice';
import DocumentWorkspace from '@potta/components/document-workspace';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
  usePreviewDownload,
} from '@potta/components/document-editor-split';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { Skeleton } from '@potta/components/ui/loaders';

const NewInvoiceInner = () => {
  const [showPreview, setShowPreview] = useState(false);
  const { registerDownload, onDownloadPdf } = usePreviewDownload();
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

  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="New invoice"
      closeHref="/account_receivables/invoice"
      bodyClassName="flex flex-col overflow-hidden"
      headerActions={
        <>
          <LocationSwitcher />
          <DocumentPreviewToggle open={showPreview} onToggle={togglePreview} />
        </>
      }
    >
      <FileExtractDropzone onExtract={extractInvoiceData} extracting={extracting}>
        <DocumentEditorSplit
          open={showPreview}
          onOpenChange={setShowPreview}
          downloadTitle="Invoice"
          onDownloadPdf={onDownloadPdf}
          editor={
            <Left
              initialInvoiceType={initialInvoiceType}
              onOpenPreview={() => setShowPreview(true)}
              showPreview={showPreview}
            />
          }
          preview={<PdfView onRegisterDownload={registerDownload} />}
        />
      </FileExtractDropzone>
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
