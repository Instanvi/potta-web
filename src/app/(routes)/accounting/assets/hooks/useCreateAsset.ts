import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '../utils/api';

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assetApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}