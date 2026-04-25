import { useMutation } from '@tanstack/react-query';
import { deductionsApi } from '../utils/api';

export function useIsApplicableDeduction() {
  return useMutation({
    mutationFn: ({ id, itemType }: { id: string; itemType: string }) =>
      deductionsApi.isApplicable(id, itemType),
  });
}
