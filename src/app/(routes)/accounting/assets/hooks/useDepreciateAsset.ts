import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '../utils/api';

export function useDepreciateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { period: string } }) => assetApi.depreciate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
} 