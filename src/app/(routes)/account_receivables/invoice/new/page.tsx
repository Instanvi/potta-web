'use client';
import React, { useCallback, useState, useContext, Suspense } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import { useSearchParams } from 'next/navigation';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import FileExtractDropzone from '@potta/components/FileExtractDropzone';
import { ContextData } from '@potta/components/providers/DataProvider';
import { extractInvoiceFromFile } from './api/extractInvoice';
import DocumentWorkspace from '@potta/components/document-workspace';
import { DocumentPreviewShell } from '@potta/components/document-master-detail';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { Skeleton } from '@potta/components/ui/loaders';

const NewInvoiceInner = () => {
  const [showPreview, setShowPreview] = useState(true);
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

  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="New invoice"
      closeHref="/account_receivables/invoice"
      headerActions={
        <>
          <LocationSwitcher />
          <button
            type="button"
            onClick={togglePreview}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[2px] border border-black/10 bg-white px-3 text-sm text-foreground hover:bg-accent"
          >
            <i className={showPreview ? 'ri-eye-off-line' : 'ri-eye-line'} />
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
        </>
      }
    >
      <FileExtractDropzone onExtract={extractInvoiceData} extracting={extracting}>
        <div className="flex h-full min-h-0 flex-col bg-main-bg">
          <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
            <ResizablePanel
              minSize={40}
              defaultSize={showPreview ? 58 : 100}
              className="min-w-0"
            >
              <div className="h-full min-h-0 overflow-y-auto bg-main-bg">
                <Left
                  initialInvoiceType={initialInvoiceType}
                  onTogglePreview={togglePreview}
                  showPreview={showPreview}
                />
              </div>
            </ResizablePanel>

            {showPreview ? (
              <>
                <ResizableHandle withHandle className="bg-transparent" />
                <ResizablePanel minSize={25} defaultSize={42} className="min-w-0">
                  <div className="h-full min-h-0 overflow-hidden border-l border-black/[0.06] bg-main-bg">
                    <DocumentPreviewShell
                      title="Preview"
                      downloadTitle="Invoice"
                      onClose={() => setShowPreview(false)}
                      onDownloadPdf={downloadPdf ?? undefined}
                    >
                      <PdfView onRegisterDownload={registerDownload} />
                    </DocumentPreviewShell>
                  </div>
                </ResizablePanel>
              </>
            ) : null}
          </ResizablePanelGroup>
        </div>
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
