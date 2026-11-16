'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Slider from '@potta/components/slideover';
import Button from '@potta/components/button';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { customerApi } from '../utils/api';
import { vendorApi } from '@potta/app/(routes)/vendors/utils/api';
import {
  downloadContactTemplate,
  prepareContactImport,
  readSpreadsheet,
  type ContactImportKind,
} from '@/lib/contact-import';

interface BulkCustomerImportProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  kind?: ContactImportKind;
}

type ImportResult = {
  created?: unknown[];
  updated?: unknown[];
  errors?: { row?: number; errors?: string[] }[];
};

const BulkSlider: React.FC<BulkCustomerImportProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
  kind = 'customer',
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const label = kind === 'customer' ? 'Customers' : 'Vendors';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const looksLikeSheet = /\.(csv|xls|xlsx)$/i.test(selectedFile.name);
    if (selectedFile.type && !validTypes.includes(selectedFile.type) && !looksLikeSheet) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setUploadStatus('idle');
    setValidationErrors([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setValidationErrors([]);

    try {
      const records = await readSpreadsheet(file);
      const prepared = prepareContactImport(kind, records);
      if (prepared.files.length === 0) {
        setValidationErrors(
          prepared.errors.length > 0 ? prepared.errors : ['No importable rows were found.']
        );
        setUploadStatus('error');
        toast.error('Nothing to import. Check the template and try again.');
        return;
      }

      const totals = { created: 0, updated: 0, errors: [...prepared.errors] };
      for (const csv of prepared.files) {
        const result = (kind === 'customer'
          ? await customerApi.importCsv(csv)
          : await vendorApi.importCsv({ file: csv })) as ImportResult;
        totals.created += result?.created?.length ?? 0;
        totals.updated += result?.updated?.length ?? 0;
        for (const error of result?.errors ?? []) {
          const detail = (error.errors ?? []).join(', ') || 'Invalid row';
          totals.errors.push(error.row ? `Row ${error.row}: ${detail}` : detail);
        }
      }

      await queryClient.invalidateQueries({
        queryKey: [kind === 'customer' ? 'get-all-customers' : 'get-all-vendors'],
      });

      if (totals.errors.length > 0) {
        setValidationErrors(totals.errors.slice(0, 20));
        setUploadStatus(totals.created + totals.updated > 0 ? 'success' : 'error');
        toast.error(
          totals.created + totals.updated > 0
            ? `Imported ${totals.created + totals.updated}, with ${totals.errors.length} row errors.`
            : 'Import failed. Fix the rows and try again.'
        );
      } else {
        setUploadStatus('success');
        toast.success(
          `${totals.created} added${totals.updated ? `, ${totals.updated} updated` : ''}.`
        );
        setTimeout(() => setIsOpen(false), 900);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error(`Failed to import ${label.toLowerCase()}`);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setUploadStatus('idle');
      setValidationErrors([]);
    }
  }, [isOpen]);

  return (
    <Slider open={isOpen} setOpen={setIsOpen} edit={false} title={`Import ${label}`} buttonText="import">
      <div className="h-full w-full">
        <div className="flex h-full w-full flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-medium">Bulk import {label.toLowerCase()}</h2>
              <p className="text-sm text-gray-600">
                Download a CSV or Excel template, fill one row per contact, then import the file.
                The type column is {kind === 'customer' ? 'INDIVIDUAL or COMPANY' : 'individual or company'}.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <Button
                text="CSV template"
                type="button"
                theme="gray"
                width="full"
                className="!flex w-full justify-center"
                onClick={() => void downloadContactTemplate(kind, 'csv')}
                icon={<FileText size={16} />}
              />
              <Button
                text="Excel template"
                type="button"
                theme="gray"
                width="full"
                className="!flex w-full justify-center"
                onClick={() => void downloadContactTemplate(kind, 'xlsx')}
                icon={<FileText size={16} />}
              />
            </div>

            <div
              {...getRootProps()}
              className={`flex min-h-[280px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
              } ${file ? 'bg-green-50' : ''}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center">
                  <FileText size={48} className="mb-3 text-green-500" />
                  <p className="font-medium">{file.name}</p>
                  <p className="mb-2 text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-2 flex items-center text-sm text-red-500 hover:text-red-600"
                  >
                    <X size={16} className="mr-1" /> Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={48} className="mb-3 text-gray-400" />
                  <p className="font-medium">{isDragActive ? 'Drop the file here' : 'Drag and drop your file here'}</p>
                  <p className="mt-1 text-sm text-gray-500">or click to browse</p>
                  <p className="mt-3 text-xs text-gray-400">Supports CSV, XLS, XLSX (max 5MB)</p>
                </div>
              )}
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
                <div className="mb-2 flex items-center">
                  <AlertCircle size={18} className="mr-2 text-red-500" />
                  <h3 className="font-medium text-red-800">Import notes</h3>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                  {validationErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {uploadStatus === 'success' && validationErrors.length === 0 && (
              <div className="mt-6 flex items-center rounded-md border border-green-200 bg-green-50 p-4">
                <CheckCircle size={18} className="mr-2 text-green-500" />
                <p className="text-green-800">{label} imported.</p>
              </div>
            )}
          </div>
          <div className="mt-4 w-full border-t bg-white pt-4">
            <Button
              text={isUploading ? 'Importing...' : `Import ${label}`}
              type="button"
              width="full"
              className="!flex w-full justify-center"
              onClick={() => void handleUpload()}
              isLoading={isUploading}
              disabled={!file || isUploading}
            />
          </div>
        </div>
      </div>
    </Slider>
  );
};

export default BulkSlider;
