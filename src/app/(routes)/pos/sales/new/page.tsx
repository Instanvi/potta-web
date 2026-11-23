'use client';
import React, { useState } from 'react';
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
import { DataProvider } from '@potta/components/providers/DataProvider';

const NewSalesReciept = () => {
  const [showPreview, setShowPreview] = useState(true);

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Determine if the preview button should be shown

  // Own provider: this form keeps its state in `data`, which would otherwise clobber the till's cart.
  return (
    <DocumentWorkspace
      title="New Sale"
      closeHref="/pos/sales"
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
      <DataProvider>
      <div className="max-h-[92.7vh] relative">
{/* Use a wrapper div with transition for the entire panel group */}
        <div className="transition-all duration-300 ease-in-out">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              minSize={50}
              defaultSize={showPreview ? 50 : 100}
              style={{ transition: 'flex-basis 300ms ease-in-out' }}
            >
              <div className="flex h-[92.7vh] justify-center bg-white p-4 md:p-5">
                <Left />
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
              <div className="h-[92.7vh] overflow-hidden bg-white">
                {showPreview && (
                  <DocumentPreviewShell
                    title="Preview"
                    downloadTitle="Sale receipt"
                    onClose={() => setShowPreview(false)}
                  >
                    <PdfView />
                  </DocumentPreviewShell>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      </DataProvider>
    </DocumentWorkspace>
  );
};

export default NewSalesReciept;
