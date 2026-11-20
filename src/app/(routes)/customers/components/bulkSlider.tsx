'use client';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import Button from '@potta/components/button';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface BulkCustomerImportProps {
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}

const BulkSlider: React.FC<BulkCustomerImportProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  // State for file upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];

      // Check file type (accept only CSV, Excel files)
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }

      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setUploadStatus('idle');
      setValidationErrors([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxFiles: 1,
  });

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate validation (in a real app, this would come from the server)
      const mockValidationErrors: string[] = [];

      if (Math.random() > 0.7) {
        // Randomly simulate validation errors for demonstration
        mockValidationErrors.push(
          'Row 3: Missing email address',
          'Row 7: Invalid phone number format',
          'Row 12: Duplicate customer email'
        );
        setValidationErrors(mockValidationErrors);
        setUploadStatus('error');
        toast.error('Import failed. Please fix the errors and try again.');
      } else {
        setUploadStatus('success');
        toast.success('Customers imported successfully!');

        // Close the slider after successful import with a delay
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('Failed to import customers');
      clearInterval(progressInterval);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state when slider is closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setUploadStatus('idle');
      setUploadProgress(0);
      setValidationErrors([]);
    }
  }, [isOpen]);

  // Download sample template
  const downloadTemplate = () => {
    // In a real app, this would download an actual template file
    toast.success('Sample template downloaded');
  };

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={false}
      title={'Import Customers'}
      buttonText="import"
    >
      <div>
        <div className="h-[87.5vh] pb-10 flex flex-col">
          <div className="p-4 flex-grow">
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">
                Bulk Import Customers
              </h2>
              <p className="text-gray-600 text-sm">
                Upload a CSV or Excel file with customer data to import multiple
                customers at once. Make sure your file follows the required
                format.
              </p>
            </div>

            {/* Download template button */}
            {/* <div className="mb-6">
              <Button
                text="Download Sample Template"
                type="button"
                theme="default"
                onClick={downloadTemplate}
                icon={<FileText size={16} />}
              />
            </div> */}

            {/* File dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 h-4/5 flex items-center justify-center text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-400'
              } ${file ? 'bg-green-50' : ''}`}
            >
              <input {...getInputProps()} />

              {file ? (
                <div className="flex flex-col items-center">
                  <FileText size={48} className="text-green-500 mb-3" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-red-500 flex items-center text-sm mt-2 hover:text-red-600"
                  >
                    <X size={16} className="mr-1" /> Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col  items-center">
                  <UploadCloud size={48} className="text-gray-400 mb-3" />
                  <p className="font-medium">
                    {isDragActive
                      ? 'Drop the file here'
                      : 'Drag & drop your file here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    Supports CSV, XLS, XLSX (max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {(isUploading || uploadStatus !== 'idle') && (
              <div className="mt-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    {uploadStatus === 'success'
                      ? 'Upload complete'
                      : uploadStatus === 'error'
                      ? 'Upload failed'
                      : 'Uploading...'}
                  </span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      uploadStatus === 'error'
                        ? 'bg-red-500'
                        : uploadStatus === 'success'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <AlertCircle size={18} className="text-red-500 mr-2" />
                  <h3 className="font-medium text-red-800">
                    Validation Errors
                  </h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success message */}
            {uploadStatus === 'success' && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                <CheckCircle size={18} className="text-green-500 mr-2" />
                <p className="text-green-800">
                  Customers imported successfully! The data is now being
                  processed.
                </p>
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
        </div>
        <div className="text-center md:text-right  md:flex  space-x-4 fixed bottom-0 left-0 right-0 justify-end bg-white p-4">
          <div className=" flex border-t ">
            <Button
              text={isUploading ? 'Uploading...' : 'Import Customers'}
              type="button"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={!file || isUploading || uploadStatus === 'success'}
            />
          </div>
        </div>
      </div>
    </Slider>
  );
};

export default BulkSlider;
