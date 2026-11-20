import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rfqService } from '../services/rfqService';
import { ProformaInvoiceRequest, ProformaInvoiceResponse } from '../types';

interface UseCreateProformaInvoiceProps {
  rfqId: string;
  token: string;
  vendorId: string;
  onSuccess?: (data: ProformaInvoiceResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateProformaInvoice = ({
  rfqId,
  token,
  vendorId,
  onSuccess,
  onError,
}: UseCreateProformaInvoiceProps) => {
  const queryClient = useQueryClient();

  return useMutation<ProformaInvoiceResponse, Error, ProformaInvoiceRequest>({
    mutationFn: (data: ProformaInvoiceRequest) =>
      rfqService.createProformaInvoice(rfqId, token, vendorId, data),
    onSuccess: (data) => {
      // Invalidate RFQ details query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['rfq-details', rfqId, token, vendorId],
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Error creating proforma invoice:', error);
      onError?.(error);
    },
  });
};
