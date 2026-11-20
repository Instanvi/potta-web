import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '../utils/api';

export function useTransferAssetLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { newLocation: string } }) =>
      assetApi.transferLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
