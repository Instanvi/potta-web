'use client';
import React, { useState } from 'react';
import {
  X,
  FileImage,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useKYCSubmission } from '../hooks';
import DocumentUploader, { DocumentUploadData } from './DocumentUploader';
import Button from '@potta/components/button';
import Select from '@potta/components/select';

interface KYCTokenData {
  token: string;
  vendorId: string;
}

interface KYCVerificationFormProps {
  tokenData: KYCTokenData;
}

export enum VendorKYCDocumentType {
  BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION',
  TAX_CLEARANCE = 'TAX_CLEARANCE',
  BANK_STATEMENT = 'BANK_STATEMENT',
  FOOD_LICENSE = 'FOOD_LICENSE',
  CONSTRUCTION_LICENSE = 'CONSTRUCTION_LICENSE',
  TRANSPORT_LICENSE = 'TRANSPORT_LICENSE',
  FINANCIAL_LICENSE = 'FINANCIAL_LICENSE',
  MEDICAL_LICENSE = 'MEDICAL_LICENSE',
  HEALTH_CERTIFICATE = 'HEALTH_CERTIFICATE',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  CREDIT_REPORT = 'CREDIT_REPORT',
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  ADDRESS_PROOF = 'ADDRESS_PROOF',
  OTHER = 'OTHER',
}

interface DocumentUploadItem {
  id: string;
  documentType: VendorKYCDocumentType;
  data?: DocumentUploadData;
}

// Document type labels
const DOCUMENT_TYPE_LABELS: Record<VendorKYCDocumentType, string> = {
  [VendorKYCDocumentType.BUSINESS_REGISTRATION]: 'Business Registration',
  [VendorKYCDocumentType.TAX_CLEARANCE]: 'Tax Clearance Certificate',
  [VendorKYCDocumentType.BANK_STATEMENT]: 'Bank Statement',
  [VendorKYCDocumentType.FOOD_LICENSE]: 'Food License',
  [VendorKYCDocumentType.CONSTRUCTION_LICENSE]: 'Construction License',
  [VendorKYCDocumentType.TRANSPORT_LICENSE]: 'Transport License',
  [VendorKYCDocumentType.FINANCIAL_LICENSE]: 'Financial License',
  [VendorKYCDocumentType.MEDICAL_LICENSE]: 'Medical License',
  [VendorKYCDocumentType.HEALTH_CERTIFICATE]: 'Health Certificate',
  [VendorKYCDocumentType.INSURANCE_CERTIFICATE]: 'Insurance Certificate',
  [VendorKYCDocumentType.VEHICLE_REGISTRATION]: 'Vehicle Registration',
  [VendorKYCDocumentType.CREDIT_REPORT]: 'Credit Report',
  [VendorKYCDocumentType.IDENTITY_DOCUMENT]: 'Identity Document',
  [VendorKYCDocumentType.ADDRESS_PROOF]: 'Proof of Address',
  [VendorKYCDocumentType.OTHER]: 'Other Document',
};

const KYCVerificationForm: React.FC<KYCVerificationFormProps> = ({
  tokenData,
}) => {
  const [documentItems, setDocumentItems] = useState<DocumentUploadItem[]>([
    { id: '1', documentType: VendorKYCDocumentType.IDENTITY_DOCUMENT },
  ]);

  const { submitKYC, isSubmitting } = useKYCSubmission();

  const addDocumentSlot = () => {
    const newItem: DocumentUploadItem = {
      id: Date.now().toString(),
      documentType: VendorKYCDocumentType.BUSINESS_REGISTRATION,
    };
    setDocumentItems((prev) => [...prev, newItem]);
  };

  const removeDocumentSlot = (id: string) => {
    setDocumentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDocumentType = (id: string, documentType: VendorKYCDocumentType) => {
    setDocumentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, documentType, data: undefined } : item
      )
    );
  };

  const updateDocumentData = (id: string, data: DocumentUploadData) => {
    setDocumentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, data } : item))
    );
    toast.success(`${data.file.name} added successfully`);
  };

  const handleSubmit = async () => {
    try {
      // Validate that at least one document is uploaded
      const uploadedDocs = documentItems.filter((item) => item.data);

      if (uploadedDocs.length === 0) {
        toast.error('Please upload at least one document');
        return;
      }

      // Submit KYC verification - documents with metadata
      await submitKYC({
        token: tokenData.token,
        vendorId: tokenData.vendorId,
        documents: uploadedDocs.map((item) => ({
          type: item.documentType,
          file: item.data!.file,
          documentNumber: item.data!.documentNumber,
          issuingAuthority: item.data!.issuingAuthority,
          expiryDate: item.data!.expiryDate,
        })),
      });

      toast.success(
        'KYC verification submitted successfully! Your documents are now under review.'
      );

      // Reset form
      setDocumentItems([
        { id: '1', documentType: VendorKYCDocumentType.IDENTITY_DOCUMENT },
      ]);
    } catch (error) {
      console.error('Error submitting KYC verification:', error);
      toast.error('Failed to submit KYC verification. Please try again.');
    }
  };

  const isFormValid = () => {
    return documentItems.some((item) => item.data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">
            KYC Verification
          </h1>
          <p className="text-gray-600 mt-1">
            Complete your identity verification to activate your vendor account
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Upload Your Documents
        </h2>
        <div className="bg-blue-50 border border-blue-200 p-4">
          <p className="text-blue-900 text-sm">
            <strong>Instructions:</strong> Select the type of document you want to upload from the dropdown, 
            then upload the file with optional details like document number, issuing authority, and expiry date.
            You can add multiple documents by clicking the "Add Another Document" button.
          </p>
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Documents
          </h2>
          <Button
            onClick={addDocumentSlot}
            type="button"
            disabled={isSubmitting}
            text="Add Document"
            icon={<Plus className="w-4 h-4" />}
            theme="default"
            className="flex items-center"
          />
        </div>

        <div className="space-y-4">
          {documentItems.map((item, index) => {
            const isUploaded = !!item.data;

            return (
              <div
                key={item.id}
                className="border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Select
                      label="Document Type"
                      options={Object.entries(DOCUMENT_TYPE_LABELS).map(
                        ([value, label]) => ({
                          value,
                          label,
                        })
                      )}
                      selectedValue={item.documentType}
                      onChange={(value: string) =>
                        updateDocumentType(
                          item.id,
                          value as VendorKYCDocumentType
                        )
                      }
                      bg="bg-white"
                      isDisabled={isSubmitting || isUploaded}
                      labelClass="text-sm"
                    />
                  </div>
                  {documentItems.length > 1 && (
                    <button
                      onClick={() => removeDocumentSlot(item.id)}
                      disabled={isSubmitting}
                      className="mt-7 text-red-600 hover:text-red-700 disabled:text-gray-400"
                      title="Remove document"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {isUploaded && item.data ? (
                  <div className="w-full">
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200">
                      <FileImage className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {item.data.file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(item.data.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        {(item.data.documentNumber ||
                          item.data.issuingAuthority ||
                          item.data.expiryDate) && (
                          <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                            {item.data.documentNumber && (
                              <div>Doc #: {item.data.documentNumber}</div>
                            )}
                            {item.data.issuingAuthority && (
                              <div>Issued by: {item.data.issuingAuthority}</div>
                            )}
                            {item.data.expiryDate && (
                              <div>Expires: {item.data.expiryDate}</div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          updateDocumentData(item.id, undefined as any)
                        }
                        className="text-red-600 hover:text-red-700"
                        disabled={isSubmitting}
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <DocumentUploader
                      documentType={{
                        id: item.id,
                        type: item.documentType,
                        label: DOCUMENT_TYPE_LABELS[item.documentType],
                        description: 'Upload your document file',
                        required: false,
                        acceptedFormats: [
                          'image/jpeg',
                          'image/png',
                          'application/pdf',
                        ],
                        maxSize: 10,
                      }}
                      onUpload={(data) => updateDocumentData(item.id, data)}
                      onError={(error) => {
                        toast.error(error);
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-gray-900">Ready to Submit?</h3>
            <p className="text-gray-600 text-sm">
              Upload at least one document to submit for verification.
              Your documents will be reviewed within 1-2 business days.
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            type="button"
            disabled={!isFormValid() || isSubmitting}
            text={isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            isLoading={isSubmitting}
            theme={isFormValid() && !isSubmitting ? 'default' : 'gray'}
            className="whitespace-nowrap"
          />
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationForm;
