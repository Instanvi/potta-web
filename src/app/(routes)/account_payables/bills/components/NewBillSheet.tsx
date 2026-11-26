'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Slider from '@potta/components/slideover';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
} from '@potta/components/document-editor-split';
import BillForm from '../new/components/BillForm';

/** "New bill" slide-over with the same side-by-side resizable preview as the full-page editor. */
const NewBillSheet = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(true);
  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      edit={false}
      wide
      noPanelScroll
      title="New bill"
    >
      {open && (
        <div className="flex h-full min-h-0 w-full flex-col">
          <div className="flex shrink-0 items-center justify-end border-b border-black/[0.06] px-3 py-2">
            <DocumentPreviewToggle open={showPreview} onToggle={togglePreview} />
          </div>
          <div className="min-h-0 flex-1">
            <BillForm
              variant="sheet"
              onOpenPreview={() => setShowPreview(true)}
              onTogglePreview={togglePreview}
              onDone={(billId) => {
                setOpen(false);
                if (billId) router.replace(`/account_payables/bills?id=${billId}`);
              }}
              renderSplit={(form, preview, actions) => (
                <DocumentEditorSplit
                  open={showPreview}
                  onOpenChange={setShowPreview}
                  downloadTitle="Bill"
                  onDownloadPdf={actions?.onDownloadPdf}
                  editor={form}
                  preview={preview}
                />
              )}
            />
          </div>
        </div>
      )}
    </Slider>
  );
};

export default NewBillSheet;
