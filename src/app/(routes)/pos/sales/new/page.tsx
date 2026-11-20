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

const NewSalesReciept = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [leftPanelSize, setLeftPanelSize] = useState(100);

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

  return (
    <RootLayout>
      <div className="max-h-[92.7vh] relative">
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center "
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
              <div
                className={`py-8 pl-14 h-[92.7vh] flex justify-center ${
                  showPreview ? 'pl-5' : 'pl-14'
                }`}
              >
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
              <div className="h-[92.7vh] bg-[#F2F2F2] overflow-hidden">
                {/* Only render PdfView when preview is showing for performance */}
                {showPreview && <PdfView />}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </RootLayout>
  );
};

export default NewSalesReciept;
