import { useQuery } from '@tanstack/react-query';
import {
  kycService,
  KYCVerificationRequest,
  KYCData,
} from '../services/kycService';

interface UseKYCVerificationProps {
  token: string;
  vendorId: string;
  kycId: string;
  enabled?: boolean;
}

export const useKYCVerification = ({
  token,
  vendorId,
  kycId,
  enabled = true,
}: UseKYCVerificationProps) => {
  return useQuery<KYCData, Error>({
    queryKey: ['kyc-verification', token, vendorId, kycId],
    queryFn: () =>
      kycService.getKYCVerification({
        token,
        vendorId,
        kycId,
      }),
    enabled: enabled && !!token && !!vendorId && !!kycId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 or 401 errors
      if (error.message.includes('404') || error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};





