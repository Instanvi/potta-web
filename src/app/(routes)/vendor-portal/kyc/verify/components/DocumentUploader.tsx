'use client';
import React, { useRef, useState } from 'react';
import { Upload, FileText, Camera, X } from 'lucide-react';
import Input from '@potta/components/input';
import Button from '@potta/components/button';

interface DocumentType {
  id: string;
  type: string;
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number; // in MB
}

export interface DocumentUploadData {
  file: File;
  documentNumber?: string;
  issuingAuthority?: string;
  expiryDate?: string;
}

interface DocumentUploaderProps {
  documentType: DocumentType;
  onUpload: (data: DocumentUploadData) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documentType,
  onUpload,
  onError,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [showDetailsForm, setShowDetailsForm] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > documentType.maxSize * 1024 * 1024) {
      return `File size must be less than ${documentType.maxSize}MB`;
    }

    // Check file type
    if (!documentType.acceptedFormats.includes(file.type)) {
      return `File type not supported. Accepted formats: ${documentType.acceptedFormats.join(
        ', '
      )}`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setSelectedFile(file);
    setShowDetailsForm(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onUpload({
        file: selectedFile,
        documentNumber: documentNumber || undefined,
        issuingAuthority: issuingAuthority || undefined,
        expiryDate: expiryDate || undefined,
      });
      // Reset form
      setSelectedFile(null);
      setShowDetailsForm(false);
      setDocumentNumber('');
      setIssuingAuthority('');
      setExpiryDate('');
    } catch (error) {
      onError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setShowDetailsForm(false);
    setDocumentNumber('');
    setIssuingAuthority('');
    setExpiryDate('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={documentType.acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!showDetailsForm ? (
        <>
      <div
        className={`
          relative border-2 border-dashed p-6 text-center cursor-pointer transition-colors
          ${
            isDragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
              <div>
                <p className="text-gray-900 font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {documentType.acceptedFormats.includes('image/') && (
                    <>
                      <Camera className="w-4 h-4 inline mr-1" />
                      Photos or
                    </>
                  )}
                  <FileText className="w-4 h-4 inline mx-1" />
                  PDF files up to {documentType.maxSize}MB
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <p>
              Accepted formats:{' '}
              {documentType.acceptedFormats
                .map((format) => {
                  if (format.startsWith('image/')) return 'Images';
                  if (format === 'application/pdf') return 'PDF';
                  return format;
                })
                .join(', ')}
            </p>
            <p>Maximum file size: {documentType.maxSize}MB</p>
          </div>
        </>
      ) : (
        <div className="border border-gray-300 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {selectedFile?.name}
              </span>
              <span className="text-xs text-gray-500">
                ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <button
              onClick={handleCancelUpload}
              className="text-gray-500 hover:text-red-600"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <Input
              label={
                <span>
                  Document Number{' '}
                  <span className="text-gray-500 text-xs">(Optional)</span>
                </span>
              }
              type="text"
              name="documentNumber"
              value={documentNumber}
              onchange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter document number"
              disabled={isUploading}
              labelClass="text-sm"
              height={true}
            />

            <Input
              label={
                <span>
                  Issuing Authority{' '}
                  <span className="text-gray-500 text-xs">(Optional)</span>
                </span>
              }
              type="text"
              name="issuingAuthority"
              value={issuingAuthority}
              onchange={(e) => setIssuingAuthority(e.target.value)}
              placeholder="e.g., Department of Motor Vehicles"
              disabled={isUploading}
              labelClass="text-sm"
              height={true}
            />

            <Input
              label={
                <span>
                  Expiry Date{' '}
                  <span className="text-gray-500 text-xs">(Optional)</span>
                </span>
              }
              type="date"
              name="expiryDate"
              value={expiryDate}
              onchange={(e) => setExpiryDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              disabled={isUploading}
              labelClass="text-sm"
              height={true}
            />

            <Button
              onClick={handleConfirmUpload}
              type="button"
              disabled={isUploading}
              text={isUploading ? 'Uploading...' : 'Confirm & Upload'}
              isLoading={isUploading}
              theme={isUploading ? 'gray' : 'default'}
              width="full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;

