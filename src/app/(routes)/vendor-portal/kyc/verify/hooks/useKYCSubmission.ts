import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  kycService,
  KYCSubmissionRequest,
} from '../services/kycService';

interface UseKYCSubmissionReturn {
  submitKYC: (request: KYCSubmissionRequest) => Promise<any>;
  isSubmitting: boolean;
  error: Error | null;
}

export const useKYCSubmission = (): UseKYCSubmissionReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, KYCSubmissionRequest>({
    mutationFn: (request) => kycService.submitKYCDocuments(request),
    onSuccess: () => {
      // Invalidate and refetch KYC verification data if needed
      queryClient.invalidateQueries({
        queryKey: ['kyc-verification'],
      });
    },
    onError: (error: any) => {
      console.error('KYC submission error:', error);

      // Show user-friendly error message
      let errorMessage = 'Failed to submit KYC verification. Please try again.';

      const status = error?.response?.status;
      
      if (status === 413) {
        errorMessage =
          'File size too large. Please compress your documents and try again.';
      } else if (status === 415) {
        errorMessage =
          'File format not supported. Please use JPG, PNG, or PDF files.';
      } else if (status === 400) {
        errorMessage =
          'Invalid request. Please check your documents and try again.';
      } else if (status === 401) {
        errorMessage =
          'Session expired or invalid token. Please check your verification link.';
      } else if (status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Don't show toast here, let the component handle it
      console.error(errorMessage);
    },
  });

  return {
    submitKYC: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
};





