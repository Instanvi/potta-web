import { useQuery } from '@tanstack/react-query';
import { kycService } from '../services/kycService';

interface UseKYCStatusProps {
  token: string;
  vendorId: string;
  kycId: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useKYCStatus = ({
  token,
  vendorId,
  kycId,
  enabled = true,
  refetchInterval,
}: UseKYCStatusProps) => {
  return useQuery({
    queryKey: ['kyc-status', token, vendorId, kycId],
    queryFn: () => kycService.getKYCStatus(token, vendorId, kycId),
    enabled: enabled && !!token && !!vendorId && !!kycId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: refetchInterval || false, // Only refetch if interval is provided
    retry: (failureCount, error) => {
      // Don't retry on 404 or 401 errors
      if (error.message.includes('404') || error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

