import { useQuery } from '@tanstack/react-query';
import { rfqService } from '../services/rfqService';
import { RFQData } from '../types';

interface UseRFQDetailsProps {
  rfqId: string;
  token: string;
  vendorId: string;
  enabled?: boolean;
}

export const useRFQDetails = ({
  rfqId,
  token,
  vendorId,
  enabled = true,
}: UseRFQDetailsProps) => {
  return useQuery<RFQData, Error>({
    queryKey: ['rfq-details', rfqId, token, vendorId],
    queryFn: () => rfqService.getRFQDetails(rfqId, token, vendorId),
    enabled: enabled && !!rfqId && !!token && !!vendorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
