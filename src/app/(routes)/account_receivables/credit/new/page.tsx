'use client';
import React, { useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import RootLayout from '../../../layout';
import FileExtractDropzone from '@potta/components/FileExtractDropzone';

const NewInvoice = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [leftPanelSize, setLeftPanelSize] = useState(100);
  const [extracting, setExtracting] = useState(false);

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

  // Extraction handler
  const extractInvoiceData = async (file: File) => {
    setExtracting(true);
    // Simulate extraction delay (replace with real extraction logic)
    setTimeout(() => setExtracting(false), 2000);
  };

  // Determine if the preview button should be shown
  const shouldShowPreviewButton = !showPreview || leftPanelSize > 95;

  return (
    <RootLayout>
      <FileExtractDropzone
        onExtract={extractInvoiceData}
        extracting={extracting}
      >
        <div className="max-h-[92.7vh]  relative">
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
              className="flex items-center bg-primary px-4 py-2 text-white hover:bg-brand-hover"
            >
              <i
                className={`${
                  showPreview ? 'ri-eye-off-line' : 'ri-eye-line'
                } mr-2`}
              ></i>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
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
                <div className="flex h-[92.7vh] justify-center overflow-y-auto p-4 md:p-5">
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
                <div className="h-[92.7vh] overflow-y-auto bg-main-bg">
                  {/* Only render PdfView when preview is showing for performance */}
                  {showPreview && <PdfView />}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </FileExtractDropzone>
    </RootLayout>
  );
};

export default NewInvoice;
