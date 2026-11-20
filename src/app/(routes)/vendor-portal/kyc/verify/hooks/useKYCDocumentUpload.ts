import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kycService, KYCDocument } from '../services/kycService';
import toast from 'react-hot-toast';

interface DocumentUploadRequest {
  token: string;
  vendorId: string;
  kycId: string;
  documentType: string;
  file: File;
}

interface UseKYCDocumentUploadReturn {
  uploadDocument: (request: DocumentUploadRequest) => Promise<KYCDocument>;
  isUploading: boolean;
  error: Error | null;
}

export const useKYCDocumentUpload = (): UseKYCDocumentUploadReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation<KYCDocument, Error, DocumentUploadRequest>({
    mutationFn: ({ token, vendorId, kycId, documentType, file }) =>
      kycService.uploadDocument(token, vendorId, kycId, documentType, file),
    onSuccess: (data, variables) => {
      // Invalidate KYC verification data to refetch with new document
      queryClient.invalidateQueries({
        queryKey: [
          'kyc-verification',
          variables.token,
          variables.vendorId,
          variables.kycId,
        ],
      });

      toast.success('Document uploaded successfully!');
    },
    onError: (error) => {
      console.error('Document upload error:', error);

      let errorMessage = 'Failed to upload document. Please try again.';

      if (error.message.includes('413')) {
        errorMessage =
          'File size too large. Please compress your document and try again.';
      } else if (error.message.includes('415')) {
        errorMessage =
          'File format not supported. Please use JPG, PNG, or PDF files.';
      } else if (error.message.includes('400')) {
        errorMessage =
          'Invalid file. Please check your document and try again.';
      }

      toast.error(errorMessage);
    },
  });

  return {
    uploadDocument: mutation.mutateAsync,
    isUploading: mutation.isPending,
    error: mutation.error,
  };
};

