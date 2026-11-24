'use client';
import React, { useCallback, useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import DocumentWorkspace from '@potta/components/document-workspace';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { DocumentPreviewShell } from '@potta/components/document-master-detail';

const NewSalesReciept = () => {
  const [showPreview, setShowPreview] = useState(true);
  const [downloadPdf, setDownloadPdf] = useState<(() => Promise<void>) | null>(
    null,
  );
  const registerDownload = useCallback((fn: () => Promise<void>) => {
    setDownloadPdf(() => fn);
  }, []);

  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="Sales receipt"
      closeHref="/account_receivables/sales_receipts"
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
      <div className="flex h-full min-h-0 flex-col bg-main-bg">
        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
          <ResizablePanel
            minSize={40}
            defaultSize={showPreview ? 58 : 100}
            className="min-w-0"
          >
            <div className="flex h-full min-h-0 flex-col bg-main-bg">
              <Left />
            </div>
          </ResizablePanel>

          {showPreview ? (
            <>
              <ResizableHandle withHandle className="bg-transparent" />
              <ResizablePanel minSize={25} defaultSize={42} className="min-w-0">
                <div className="h-full min-h-0 overflow-hidden border-l border-black/[0.06] bg-main-bg">
                  <DocumentPreviewShell
                    title="Preview"
                    downloadTitle="Sales receipt"
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
    </DocumentWorkspace>
  );
};

export default NewSalesReciept;
