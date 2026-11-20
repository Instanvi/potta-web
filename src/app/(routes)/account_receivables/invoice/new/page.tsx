'use client';
import React, { useState, useContext, Suspense } from 'react';
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
import RootLayout from '../../../layout';

const NewInvoiceInner = () => {
  const [showPreview, setShowPreview] = useState(true);
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
    <FileExtractDropzone onExtract={extractInvoiceData} extracting={extracting}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 bg-primary px-3 text-primary-foreground md:px-4">
          <p className="truncate text-sm font-medium">New invoice</p>
          <button
            type="button"
            onClick={togglePreview}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[2px] bg-white/15 px-3 text-sm text-white hover:bg-white/25"
          >
            <i className={showPreview ? 'ri-eye-off-line' : 'ri-eye-line'} />
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
        </div>

        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
          <ResizablePanel
            minSize={40}
            defaultSize={showPreview ? 58 : 100}
            className="min-w-0"
          >
            <div className="h-full min-h-0 overflow-y-auto">
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
                <div className="h-full min-h-0 overflow-y-auto border-l border-black/[0.06] bg-main-bg">
                  <PdfView />
                </div>
              </ResizablePanel>
            </>
          ) : null}
        </ResizablePanelGroup>
      </div>
    </FileExtractDropzone>
  );
};

const NewInvoice = () => (
  <RootLayout>
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
      <NewInvoiceInner />
    </Suspense>
  </RootLayout>
);

export default NewInvoice;
